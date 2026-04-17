import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useProfile(targetUserId: string, currentUserId: string, initialProfile: any) {
    const [profile, setProfile] = useState(initialProfile);
    const [loading, setLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isListOpen, setIsListOpen] = useState(false);
    const [listType, setListType] = useState<'followers' | 'following'>('followers');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const feedRef = useRef<any>(null);

    // フォロー状態を取得
    useEffect(() => {
        if (currentUserId && targetUserId && currentUserId !== targetUserId) {
            checkFollowStatus();
            checkBlockStatus();
        }
    }, [currentUserId, targetUserId]);

    // フォロー数・フォロワー数を取得
    useEffect(() => {
        if (targetUserId) {
            fetchFollowCounts();
        }
    }, [targetUserId]);

    // プロフィール情報を取得
    useEffect(() => {
        if (targetUserId) {
            fetchProfile();
        }
    }, [targetUserId]);

    const fetchProfile = async () => {
        // すでにデータがあるときはローディングを出さない（画面をチラつかせないため）
        if (!profile) setLoading(true);
        try {
            // ★★★ ここが一番大事！ 'users' を 'profiles' に変更！ ★★★
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .maybeSingle(); // エラー回避のために maybeSingle に変更

            if (error) throw error;
            if (data) setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            // toast.error('プロフィールの取得に失敗しました'); // うるさいので消す
        } finally {
            setLoading(false);
        }
    };

    const checkFollowStatus = async () => {
        try {
            const { data, error } = await supabase.from('follows').select('id').eq('follower_id', currentUserId).eq('following_id', targetUserId).maybeSingle();
            if (error) throw error;
            setIsFollowing(!!data);
        } catch (error) { console.error(error); }
    };

    const checkBlockStatus = async () => {
        try {
            const { data, error } = await supabase.from('blocks').select('id').eq('blocker_id', currentUserId).eq('blocked_id', targetUserId).maybeSingle();
            if (error) throw error;
            setIsBlocked(!!data);
        } catch (error) { console.error(error); }
    };

    const fetchFollowCounts = async () => {
        try {
            const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId);
            const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId);
            setFollowersCount(followers || 0);
            setFollowingCount(following || 0);
        } catch (error) { console.error(error); }
    };

    const handleFollow = async () => {
        if (!currentUserId || currentUserId === targetUserId) return;
        try {
            if (isFollowing) {
                const { error } = await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', targetUserId);
                if (error) throw error;
                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
                toast.success('フォローを解除しました');
            } else {
                const { error } = await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId });
                if (error) throw error;
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
                toast.success('フォローしました');
            }
        } catch (error) { console.error(error); toast.error('処理に失敗しました'); }
    };

    const handleBlock = async () => {
        if (!currentUserId || currentUserId === targetUserId) return;
        try {
            if (isBlocked) {
                const { error } = await supabase.from('blocks').delete().eq('blocker_id', currentUserId).eq('blocked_id', targetUserId);
                if (error) throw error;
                setIsBlocked(false);
                toast.success('ブロックを解除しました');
            } else {
                const { error } = await supabase.from('blocks').insert({ blocker_id: currentUserId, blocked_id: targetUserId });
                if (error) throw error;
                if (isFollowing) {
                    await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', targetUserId);
                    setIsFollowing(false);
                    setFollowersCount(prev => Math.max(0, prev - 1));
                }
                setIsBlocked(true);
                toast.success('ブロックしました');
            }
        } catch (error) { console.error(error); toast.error('処理に失敗しました'); }
    };

    return {
        profile,
        loading,
        isFollowing,
        isBlocked,
        followersCount,
        followingCount,
        isListOpen,
        setIsListOpen,
        listType,
        setListType,
        isPostModalOpen,
        setIsPostModalOpen,
        feedRef,
        handleFollow,
        handleBlock,
        refreshProfile: fetchProfile // ★これで画面更新もバッチリ！
    };
}