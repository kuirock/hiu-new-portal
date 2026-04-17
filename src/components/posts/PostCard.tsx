import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Heart, MessageCircle, MoreHorizontal, Trash2, User, Send, AlertTriangle, EyeOff, Eye, Edit2, Image as ImageIcon, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { usePostCard, REPORT_REASONS } from './usePostCard';
import { getOptimizedUrl } from '../../lib/cloudinary'; // 🌟 追加：最適化魔法！

interface PostCardProps {
    post: any;
    currentUserId?: string;
    currentUserRole?: string;
    onLike?: (postId: string) => void;
    onDelete?: (postId: string) => void;
    onComment?: (postId: string, comment: string) => void;
    onReport?: (postId: string, reason: string, hideAfterReport: boolean) => Promise<boolean | void>;
    onHidePost?: (postId: string) => void;
    onUnhidePost?: (postId: string) => void;
    onRemovePost?: (postId: string) => void;
    onEditPost?: (postId: string, newContent: string, newMediaUrl?: string | null, newMediaType?: string | null) => Promise<boolean | void>;
}

export const PostCard = React.memo(function PostCard(props: PostCardProps) {
    const { post, onLike, onDelete, onHidePost, onUnhidePost, onRemovePost } = props;

    const {
        canDelete, canReport, canHide, canEdit, isHidden,
        likesCount, isLiked, commentsCount, commentsList,
        isCommentOpen, setIsCommentOpen,
        commentText, setCommentText, isSubmitting,
        isReportOpen, setIsReportOpen,
        selectedReason, setSelectedReason,
        otherReasonText, setOtherReasonText, isReporting,
        isHideConfirmOpen, setIsHideConfirmOpen,
        isEditOpen, setIsEditOpen,
        editContent, setEditContent, isEditing,
        editMediaPreview, setEditMediaPreview, setEditMedia, setRemoveMedia, fileInputRef, openEditDialog,
        isImageViewerOpen, setIsImageViewerOpen, // 🌟 追加
        handleSubmitComment, handleReportSubmit, handleFinalizeReport, handleEditSubmit
    } = usePostCard(props);

    if (isHidden) {
        return (
            <div className="bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:bg-gray-100">
                <div className="flex items-center gap-3 text-gray-500">
                    <div className="bg-gray-200 p-2 rounded-full">
                        <EyeOff className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">非表示に設定した投稿です</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 h-8 text-xs font-bold rounded-full"
                        onClick={() => onUnhidePost?.(post.id)}
                    >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        表示する
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 h-8 text-xs font-bold rounded-full"
                        onClick={() => {
                            if (confirm('あなたの画面からこの投稿を完全に削除しますか？\n（他の人の画面には影響しません）')) {
                                onRemovePost?.(post.id);
                            }
                        }}
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        画面から削除
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-gray-100">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gray-100 text-gray-400">
                            <User className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                            {post.profiles?.username || '名無しさん'}
                        </h3>
                        <p className="text-xs text-gray-400">
                            {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja }) : ''}
                        </p>
                    </div>
                </div>

                {(canDelete || canReport || canHide || canEdit) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && (
                                <DropdownMenuItem
                                    className="text-indigo-600 focus:text-indigo-600 focus:bg-indigo-50 cursor-pointer"
                                    onClick={openEditDialog}
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    編集する
                                </DropdownMenuItem>
                            )}

                            {canHide && (
                                <DropdownMenuItem
                                    className="text-gray-600 focus:text-gray-900 focus:bg-gray-50 cursor-pointer"
                                    onClick={() => onHidePost?.(post.id)}
                                >
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    非表示にする
                                </DropdownMenuItem>
                            )}

                            {canReport && (
                                <DropdownMenuItem
                                    className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 cursor-pointer"
                                    onClick={() => setIsReportOpen(true)}
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    通報する
                                </DropdownMenuItem>
                            )}

                            {canDelete && (
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                    onClick={() => onDelete?.(post.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    削除する
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="mt-3 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {post.content}
            </div>

            {post.media_url && post.media_type === 'image' && (
                <div
                    className="mt-3 rounded-xl overflow-hidden border border-gray-100 cursor-pointer group relative"
                    onClick={() => setIsImageViewerOpen(true)} // 🌟 クリックでビューアーを開く！
                >
                    <img
                        src={getOptimizedUrl(post.media_url, 800)} // 🌟 最適化URLを使う！
                        alt="投稿画像"
                        className="w-full h-auto object-cover max-h-96 transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <Eye className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" />
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center gap-4 border-t border-gray-50 pt-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 gap-1.5 px-2 rounded-full text-xs hover:bg-pink-50 ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                    onClick={() => onLike?.(post.id)}
                >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likesCount}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 gap-1.5 px-2 rounded-full text-xs hover:text-indigo-500 hover:bg-indigo-50 ${isCommentOpen ? 'text-indigo-500 bg-indigo-50' : 'text-gray-400'}`}
                    onClick={() => setIsCommentOpen(!isCommentOpen)}
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>{commentsCount}</span>
                </Button>
            </div>

            {isCommentOpen && (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3">
                        {commentsList.map((comment: any) => (
                            <div key={comment.id} className="flex gap-2">
                                <Avatar className="w-7 h-7 border border-gray-100 shrink-0">
                                    <AvatarImage src={comment.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-gray-100 text-[10px] text-gray-400">
                                        <User className="w-3 h-3" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-gray-50 rounded-2xl rounded-tl-none px-3 py-2 text-sm max-w-[85%] break-words">
                                    <span className="font-bold text-gray-800 text-xs mr-2">
                                        {comment.profiles?.username || '名無しさん'}
                                    </span>
                                    <span className="text-gray-700">{comment.content}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmitComment} className="flex gap-2 items-center mt-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="コメントを追加..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            disabled={isSubmitting}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!commentText.trim() || isSubmitting}
                            className="rounded-full w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0"
                        >
                            <Send className="w-4 h-4 -ml-0.5" />
                        </Button>
                    </form>
                </div>
            )}

            {/* 🌟🌟🌟 新規追加：画像拡大ビューアー 🌟🌟🌟 */}
            <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
                <DialogContent className="max-w-4xl w-[95vw] p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
                    <DialogHeader className="sr-only">
                        <DialogTitle>画像拡大</DialogTitle>
                        <DialogDescription>画像の拡大表示です</DialogDescription>
                    </DialogHeader>

                    <div className="relative w-full flex justify-center items-center">
                        <img
                            src={post.media_url} // 🌟 ここは圧縮しないフルサイズのオリジナル画像を出す！
                            alt="拡大画像"
                            className="max-h-[85vh] max-w-full object-contain rounded-md"
                        />
                        <button
                            onClick={() => setIsImageViewerOpen(false)}
                            className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                            <Edit2 className="w-5 h-5" />
                            投稿を編集する
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            投稿の編集フォーム
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32 text-sm"
                            placeholder="いまどうしてる？"
                        />

                        {editMediaPreview && (
                            <div className="relative inline-block mt-2">
                                <img
                                    src={editMediaPreview}
                                    alt="preview"
                                    className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditMedia(null);
                                        setEditMediaPreview(null);
                                        setRemoveMedia(true);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setEditMedia(e.target.files[0]);
                                            setEditMediaPreview(URL.createObjectURL(e.target.files[0]));
                                            setRemoveMedia(false);
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isEditing}>
                                    キャンセル
                                </Button>
                                <Button
                                    onClick={handleEditSubmit}
                                    disabled={isEditing || (!editContent.trim() && !editMediaPreview)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {isEditing ? '保存中...' : '保存する'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="w-5 h-5" />
                            この投稿を通報する
                        </DialogTitle>
                        <DialogDescription>
                            不適切な投稿として管理者に報告します。最も近い理由を選んでね！
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 pt-2">
                        {REPORT_REASONS.map((reason) => (
                            <button
                                key={reason}
                                onClick={() => setSelectedReason(reason)}
                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${selectedReason === reason
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                {reason}
                            </button>
                        ))}

                        {selectedReason === 'その他' && (
                            <textarea
                                value={otherReasonText}
                                onChange={(e) => setOtherReasonText(e.target.value)}
                                placeholder="具体的な理由を教えてね..."
                                className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-20 text-sm animate-in fade-in"
                            />
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsReportOpen(false)} disabled={isReporting}>
                                キャンセル
                            </Button>
                            <Button
                                onClick={handleReportSubmit}
                                disabled={isReporting || (selectedReason === 'その他' && !otherReasonText.trim())}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                次へ
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isHideConfirmOpen} onOpenChange={(open) => {
                setIsHideConfirmOpen(open);
                if (!open) handleFinalizeReport(false);
            }}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-gray-800">
                            <EyeOff className="w-5 h-5 text-gray-500" />
                            この投稿を非表示にしますか？
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            通報ありがとうございます。<br />
                            今後、この投稿をあなたの画面に表示しないように設定できます。
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button
                            onClick={() => handleFinalizeReport(true)}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                        >
                            <EyeOff className="w-4 h-4 mr-2" />
                            非表示にする（推奨）
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleFinalizeReport(false)}
                            className="w-full text-gray-600"
                        >
                            非表示にせず通報のみ送信
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.post.id === nextProps.post.id &&
        prevProps.post.content === nextProps.post.content &&
        prevProps.post.media_url === nextProps.post.media_url &&
        prevProps.post.likes?.length === nextProps.post.likes?.length &&
        prevProps.post.comments?.length === nextProps.post.comments?.length &&
        prevProps.post.isHidden === nextProps.post.isHidden
    );
});