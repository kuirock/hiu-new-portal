import { useState, useEffect, useCallback } from 'react'; // 🌟 useCallback を追加！
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { getPublicIdFromUrl } from '../../lib/cloudinary';

export function usePostFeed(currentUserId: string, targetUserId?: string) {
    const [posts, setPosts] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string>('user');

    // 🌟🌟🌟 新規追加：無限スクロール用の状態管理 🌟🌟🌟
    const [hasMore, setHasMore] = useState(true); // まだ読み込める投稿があるか？
    const [isLoadingMore, setIsLoadingMore] = useState(false); // 追加読み込み中か？
    const [page, setPage] = useState(0); // 今何ページ目か？
    const POSTS_PER_PAGE = 10; // 1回で読み込む件数（10件に減らして爆速化！）

    const [hiddenPostIds, setHiddenPostIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('hidden_posts');
        return saved ? JSON.parse(saved) : [];
    });
    const [hiddenAnnouncementIds, setHiddenAnnouncementIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('hidden_announcements');
        return saved ? JSON.parse(saved) : [];
    });

    const [removedPostIds, setRemovedPostIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('removed_posts');
        return saved ? JSON.parse(saved) : [];
    });
    const [removedAnnouncementIds, setRemovedAnnouncementIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('removed_announcements');
        return saved ? JSON.parse(saved) : [];
    });

    // 🌟 初回読み込み（1ページ目）
    const fetchPosts = async () => {
        setLoading(true);
        setPage(0); // ページをリセット
        setHasMore(true); // 読み込み可能状態にリセット

        if (currentUserId) {
            const { data: profileData } = await supabase.from('profiles').select('role').eq('id', currentUserId).single();
            if (profileData) setCurrentUserRole(profileData.role || 'user');
        }

        if (!targetUserId) {
            const now = new Date().toISOString();

            // 1. まず「期限切れの告知」をDBから探す！🔍
            const { data: expiredPosts } = await supabase
                .from('posts')
                .select('id, media_url, media_type')
                .eq('is_announcement', true)
                .lt('expires_at', now);

            // 2. 期限切れの告知があったら…
            if (expiredPosts && expiredPosts.length > 0) {
                // 画像をCloudinaryから消す！（前に作ったEdge Functionを使うよ！）
                for (const post of expiredPosts) {
                    if (post.media_url) {
                        const publicId = getPublicIdFromUrl(post.media_url);
                        if (publicId) {
                            const resourceType = post.media_type === 'video' ? 'video' : 'image';
                            // 🌟 ここでEdge Functionを呼び出し！
                            supabase.functions.invoke('delete-cloudinary-image', {
                                body: { public_id: publicId, resource_type: resourceType }
                            });
                        }
                    }
                }

                // 3. 最後にDBから告知自体を削除する🗑️
                await supabase.from('posts').delete().eq('is_announcement', true).lt('expires_at', now);
            }
        }

        // 🌟 limitではなく、range(0, 9) を使って最初の10件を取得する！
        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles (username, avatar_url),
                likes (user_id),
                comments (id, content, user_id, created_at, profiles (username))
            `)
            .eq('is_announcement', false)
            .order('created_at', { ascending: false })
            .range(0, POSTS_PER_PAGE - 1);

        if (targetUserId) {
            query = query.eq('user_id', targetUserId);
        }

        const { data: postsData, error: postsError } = await query;

        if (postsError) {
            console.error("🔥投稿取得エラー:", postsError);
            toast.error('投稿の読み込みに失敗しました😢');
        } else if (postsData) {
            const formattedPosts = postsData.map(post => ({
                ...post,
                profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
                likes: post.likes || [],
                comments: (post.comments || []).map((c: any) => ({
                    ...c,
                    profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
                }))
            }));
            setPosts(formattedPosts);

            // 取れた件数が10件未満なら、「もう次のページはないよ！」と判定する
            if (postsData.length < POSTS_PER_PAGE) {
                setHasMore(false);
            }
        }

        if (!targetUserId) {
            const { data: announcementsData } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles (username, avatar_url)
                `)
                .eq('is_announcement', true)
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
                .order('created_at', { ascending: false })
                .limit(5);

            if (announcementsData) {
                const formattedAnnouncements = announcementsData.map(post => ({
                    ...post,
                    profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
                }));
                setAnnouncements(formattedAnnouncements);
            }
        }

        setLoading(false);
    };

    // 🌟🌟🌟 新規追加：追加読み込み（2ページ目以降） 🌟🌟🌟
    const loadMorePosts = useCallback(async () => {
        // もし「もうない」か「今読み込み中」なら何もしない
        if (!hasMore || isLoadingMore) return;

        setIsLoadingMore(true);
        const nextPage = page + 1;
        const from = nextPage * POSTS_PER_PAGE;
        const to = from + POSTS_PER_PAGE - 1;

        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles (username, avatar_url),
                likes (user_id),
                comments (id, content, user_id, created_at, profiles (username))
            `)
            .eq('is_announcement', false)
            .order('created_at', { ascending: false })
            .range(from, to); // 🌟 「〇件目〜〇件目」を指定！

        if (targetUserId) {
            query = query.eq('user_id', targetUserId);
        }

        const { data: postsData, error: postsError } = await query;

        if (postsError) {
            console.error("🔥追加読み込みエラー:", postsError);
        } else if (postsData) {
            const formattedPosts = postsData.map(post => ({
                ...post,
                profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
                likes: post.likes || [],
                comments: (post.comments || []).map((c: any) => ({
                    ...c,
                    profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
                }))
            }));

            // 今ある投稿の後ろに、新しく取ってきた投稿をくっつける！
            setPosts(prev => [...prev, ...formattedPosts]);
            setPage(nextPage);

            // 取れた件数が10件未満なら、「これで最後！」と判定する
            if (postsData.length < POSTS_PER_PAGE) {
                setHasMore(false);
            }
        }
        setIsLoadingMore(false);
    }, [hasMore, isLoadingMore, page, targetUserId]);


    useEffect(() => {
        fetchPosts();
    }, [targetUserId]);

    const addOnePost = (newPost: any) => {
        setPosts(prev => [newPost, ...prev]);
    };

    // --- いいね・コメント・通報・削除などの関数はそのまま ---
    const toggleLike = async (postId: string) => { /* 変更なし */
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        const currentLikes = post.likes || [];
        const isLiked = currentLikes.some((l: any) => l.user_id === currentUserId);
        setPosts(currentPosts => currentPosts.map(p => {
            if (p.id === postId) {
                const likesArray = p.likes || [];
                if (isLiked) {
                    return { ...p, likes: likesArray.filter((l: any) => l.user_id !== currentUserId) };
                } else {
                    return { ...p, likes: [...likesArray, { user_id: currentUserId }] };
                }
            }
            return p;
        }));
        if (isLiked) {
            await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
        } else {
            await supabase.from('likes').insert({ post_id: postId, user_id: currentUserId });
        }
    };

    const handleComment = async (postId: string, comment: string) => { /* 変更なし */
        if (!comment.trim()) return;
        const { data, error } = await supabase.from('comments').insert({ post_id: postId, user_id: currentUserId, content: comment }).select('*, profiles (username)').single();
        if (error) { toast.error("コメントできませんでした💦"); return; }
        if (data) {
            const formattedComment = { ...data, profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles };
            toast.success('コメントしました💬');
            setPosts(prev => prev.map(p => {
                if (p.id === postId) return { ...p, comments: [...(p.comments || []), formattedComment] };
                return p;
            }));
        }
    };

    const handleReport = async (postId: string, reason: string, hideAfterReport: boolean = false, isAnnouncement: boolean = false) => { /* 変更なし */
        if (!reason.trim()) return false;
        const { error } = await supabase.from('reports').insert({ post_id: postId, reporter_id: currentUserId, reason: reason });
        if (error) {
            if (error.code === '23505') toast.error('この投稿は既に通報済みです🚨');
            else { console.error("🔥通報エラー:", error); toast.error('通報に失敗しました💦'); }
            return false;
        } else {
            toast.success('管理者に通報しました🚨');
            if (hideAfterReport) {
                if (isAnnouncement) {
                    setHiddenAnnouncementIds(prev => { const next = [...prev, postId]; localStorage.setItem('hidden_announcements', JSON.stringify(next)); return next; });
                } else {
                    setHiddenPostIds(prev => { const next = [...prev, postId]; localStorage.setItem('hidden_posts', JSON.stringify(next)); return next; });
                }
            }
            return true;
        }
    };

    const handleHidePost = (postId: string) => { /* 変更なし */
        setHiddenPostIds(prev => { const next = [...prev, postId]; localStorage.setItem('hidden_posts', JSON.stringify(next)); return next; });
        toast.success('投稿を非表示にしました👀');
    };
    const handleUnhidePost = (postId: string) => { /* 変更なし */
        setHiddenPostIds(prev => { const next = prev.filter(id => id !== postId); localStorage.setItem('hidden_posts', JSON.stringify(next)); return next; });
    };
    const handleRemovePost = (postId: string) => { /* 変更なし */
        setRemovedPostIds(prev => { const next = [...prev, postId]; localStorage.setItem('removed_posts', JSON.stringify(next)); return next; });
        toast.success('自分の画面から完全に削除しました🗑️');
    };
    const handleHideAnnouncement = (announcementId: string) => { /* 変更なし */
        setHiddenAnnouncementIds(prev => { const next = [...prev, announcementId]; localStorage.setItem('hidden_announcements', JSON.stringify(next)); return next; });
        toast.success('告知を非表示にしました👀');
    };
    const handleUnhideAnnouncement = (announcementId: string) => { /* 変更なし */
        setHiddenAnnouncementIds(prev => { const next = prev.filter(id => id !== announcementId); localStorage.setItem('hidden_announcements', JSON.stringify(next)); return next; });
    };
    const handleRemoveAnnouncement = (announcementId: string) => { /* 変更なし */
        setRemovedAnnouncementIds(prev => { const next = [...prev, announcementId]; localStorage.setItem('removed_announcements', JSON.stringify(next)); return next; });
        toast.success('自分の画面から完全に削除しました🗑️');
    };

    const handleDelete = async (postId: string) => { /* 変更なし */
        if (!confirm('本当に削除しますか？')) return;
        const postToDelete = posts.find(p => p.id === postId) || announcements.find(a => a.id === postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
        setAnnouncements(prev => prev.filter(a => a.id !== postId));
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) { toast.error('削除できませんでした💦'); return; }
        if (postToDelete?.media_url) {
            const publicId = getPublicIdFromUrl(postToDelete.media_url);
            if (publicId) {
                const resourceType = postToDelete.media_type === 'video' ? 'video' : 'image';
                supabase.functions.invoke('delete-cloudinary-image', { body: { public_id: publicId, resource_type: resourceType } });
            }
        }
        toast.success('削除しました🗑️');
    };

    const handleEditPost = async (postId: string, newContent: string, newMediaUrl?: string | null, newMediaType?: string | null) => { /* 変更なし */
        const updateData: any = { content: newContent };
        if (newMediaUrl !== undefined) { updateData.media_url = newMediaUrl; updateData.media_type = newMediaType; }
        const { error } = await supabase.from('posts').update(updateData).eq('id', postId);
        if (error) { console.error("🔥編集エラー:", error); toast.error('編集に失敗しました💦'); return false; }
        else { toast.success('編集を保存しました✨'); setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updateData } : p)); return true; }
    };

    const handleEditAnnouncement = async (announcementId: string, newContent: string, newTitle?: string, newMediaUrl?: string | null, newMediaType?: string | null) => { /* 変更なし */
        const updateData: any = { content: newContent };
        if (newTitle !== undefined) { updateData.title = newTitle; }
        if (newMediaUrl !== undefined) { updateData.media_url = newMediaUrl; updateData.media_type = newMediaType; }
        const { error } = await supabase.from('posts').update(updateData).eq('id', announcementId);
        if (error) { console.error("🔥編集エラー:", error); toast.error('編集に失敗しました💦'); return false; }
        else { toast.success('編集を保存しました✨'); setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, ...updateData } : a)); return true; }
    };

    const visiblePosts = posts
        .filter(p => !removedPostIds.includes(p.id))
        .map(p => ({ ...p, isHidden: hiddenPostIds.includes(p.id) }));

    const visibleAnnouncements = announcements
        .filter(a => !removedAnnouncementIds.includes(a.id))
        .map(a => ({ ...a, isHidden: hiddenAnnouncementIds.includes(a.id) }));

    return {
        posts: visiblePosts,
        announcements: visibleAnnouncements,
        loading, refreshPosts: fetchPosts,
        addOnePost, toggleLike, handleComment, handleReport,
        handleDelete, handleHidePost, handleUnhidePost, handleRemovePost,
        handleHideAnnouncement, handleUnhideAnnouncement, handleRemoveAnnouncement,
        handleEditPost, handleEditAnnouncement,
        currentUserId, currentUserRole,
        // 🌟 画面側（UI）に無限スクロール用の関数と状態を渡す！
        hasMore, isLoadingMore, loadMorePosts
    };
}