import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react'; // 🌟 useEffectとuseRefを追加！
import { usePostFeed } from './usePostFeed';
import { PostForm } from './PostForm';
import { PostCard } from './PostCard';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { Megaphone, Pen, X, Loader2 } from 'lucide-react'; // 🌟 Loader2 を追加！
import { AdminReportModal } from '../admin/AdminReportModal';

export interface PostFeedRef {
    refresh: () => void;
}

interface PostFeedProps {
    currentUserId: string;
    targetUserId?: string;
    onAnnouncementCreated?: () => void;
}

export const PostFeed = forwardRef<PostFeedRef, PostFeedProps>(
    ({ currentUserId, targetUserId, onAnnouncementCreated }, ref) => {
        const {
            posts, loading, refreshPosts, addOnePost, toggleLike, handleComment,
            handleReport, handleDelete, handleHidePost, handleUnhidePost, handleRemovePost,
            handleEditPost,
            currentUserRole,
            // 🌟 usePostFeed から無限スクロール用の3つを受け取る！
            hasMore, isLoadingMore, loadMorePosts
        } = usePostFeed(currentUserId, targetUserId);

        const [isPostOpen, setIsPostOpen] = useState(false);
        const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

        // 🌟 「ここまでスクロールされたら次を読み込む」ための目印（透明な箱）
        const observerTarget = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            refresh: refreshPosts
        }));

        // 🌟 スクロール検知の魔法（Intersection Observer API）
        useEffect(() => {
            const observer = new IntersectionObserver(
                entries => {
                    // 目印が画面に入ったら、次を読み込む！
                    if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                        loadMorePosts();
                    }
                },
                { threshold: 0.1 } // 10%見えたら早めに読み込み開始
            );

            if (observerTarget.current) {
                observer.observe(observerTarget.current);
            }

            return () => observer.disconnect();
        }, [hasMore, isLoadingMore, loadMorePosts]);

        if (loading) {
            return (
                <div className="space-y-4 p-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            );
        }

        return (
            <div className="max-w-2xl mx-auto pb-24 relative">
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            onLike={toggleLike}
                            onDelete={handleDelete}
                            onComment={handleComment}
                            onReport={handleReport}
                            onHidePost={handleHidePost}
                            onUnhidePost={handleUnhidePost}
                            onRemovePost={handleRemovePost}
                            onEditPost={handleEditPost}
                        />
                    ))}
                </div>

                {/* 🌟🌟🌟 無限スクロールの目印 ＆ ローディング表示 🌟🌟🌟 */}
                {hasMore && (
                    <div ref={observerTarget} className="py-10 flex justify-center items-center">
                        {isLoadingMore && (
                            <div className="flex flex-col items-center gap-2 text-indigo-500">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-xs font-bold">さらに読み込み中...</span>
                            </div>
                        )}
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <div className="py-10 text-center flex items-center justify-center">
                        <span className="text-gray-400 text-sm font-bold bg-gray-100 px-6 py-2 rounded-full border border-gray-200">
                            すべての投稿を読み込みました✨
                        </span>
                    </div>
                )}


                <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-4 z-50">
                    {/* ... 投稿ボタンと告知ボタンのコードはそのままなので省略 ... */}
                    <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                                <Pen className="w-7 h-7" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !w-full !max-w-none !h-[100dvh] !bg-transparent !border-none !shadow-none !p-4 sm:!p-6 !block overflow-y-auto custom-scrollbar touch-pan-y [&>button]:hidden">
                            <div className="w-full sm:max-w-lg mx-auto mt-12 sm:mt-24 mb-24 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => setIsPostOpen(false)}
                                    className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                                            <Pen className="w-5 h-5" />
                                            新規投稿
                                        </DialogTitle>
                                        <DialogDescription className="sr-only">新規投稿フォーム</DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className="p-4 sm:p-5">
                                    <PostForm
                                        currentUserId={currentUserId}
                                        onPostSuccess={(newPost) => {
                                            setIsPostOpen(false);
                                            if (newPost && !newPost.is_announcement) {
                                                addOnePost(newPost);
                                            } else {
                                                refreshPosts();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                                <Megaphone className="w-7 h-7" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !w-full !max-w-none !h-[100dvh] !bg-transparent !border-none !shadow-none !p-4 sm:!p-6 !block overflow-y-auto custom-scrollbar touch-pan-y [&>button]:hidden">
                            <div className="w-full sm:max-w-lg mx-auto mt-12 sm:mt-24 mb-24 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => setIsAnnouncementOpen(false)}
                                    className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                                            <Megaphone className="w-5 h-5" />
                                            告知の作成
                                        </DialogTitle>
                                        <DialogDescription className="sr-only">告知作成フォーム</DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className="p-4 sm:p-5">
                                    <PostForm
                                        currentUserId={currentUserId}
                                        onPostSuccess={() => {
                                            setIsAnnouncementOpen(false);
                                            refreshPosts();
                                            onAnnouncementCreated?.();
                                        }}
                                        isAnnouncement={true}
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {currentUserRole === 'admin' && (
                        <AdminReportModal />
                    )}
                </div>
            </div>
        );
    }
);

PostFeed.displayName = "PostFeed";