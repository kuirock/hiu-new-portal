import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
import { Megaphone, Calendar, ArrowRight, AlertTriangle, EyeOff, Eye, Trash2, Edit2, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAnnouncementCarousel } from './useAnnouncementCarousel';
import { getOptimizedUrl } from '../../lib/cloudinary';

interface Announcement {
    id: string;
    user_id?: string;
    title?: string;
    content: string;
    image_url?: string;
    media_url?: string;
    created_at: string;
    category?: string;
    profiles?: { username: string; avatar_url: string };
    isHidden?: boolean;
}

interface AnnouncementCarouselProps {
    announcements?: Announcement[];
    currentUserId?: string;
    onReport?: (postId: string, reason: string, hideAfterReport: boolean, isAnnouncement: boolean) => Promise<boolean | void>;
    onHideAnnouncement?: (announcementId: string) => void;
    onUnhideAnnouncement?: (announcementId: string) => void;
    onRemoveAnnouncement?: (announcementId: string) => void;
    onDelete?: (announcementId: string) => void;
    onEditAnnouncement?: (announcementId: string, newContent: string, newTitle?: string, newMediaUrl?: string | null, newMediaType?: string | null) => Promise<boolean | void>;
}

export function AnnouncementCarousel(props: AnnouncementCarouselProps) {
    const { announcements, currentUserId, onHideAnnouncement, onUnhideAnnouncement, onRemoveAnnouncement, onDelete } = props;
    const safeAnnouncements = announcements || [];

    const {
        openDialogId, setOpenDialogId,
        isReportOpen, setIsReportOpen,
        selectedReason, setSelectedReason,
        otherReasonText, setOtherReasonText,
        isReporting, setReportingAnnouncementId,
        isHideConfirmOpen, setIsHideConfirmOpen,
        isEditOpen, setIsEditOpen,
        editTitle, setEditTitle,
        editContent, setEditContent,
        isEditing,
        editMediaPreview, setEditMediaPreview, setEditMedia, setRemoveMedia, fileInputRef,
        viewerImage, setViewerImage,
        plugin, containerRef,
        handleReportSubmit, handleFinalizeReport, handleEditSubmit,
        openEditDialog, openReportDialog,
        REPORT_REASONS
    } = useAnnouncementCarousel(props);

    if (safeAnnouncements.length === 0) return null;

    return (
        <div ref={containerRef} className="mb-6 relative group prevent-swipe">
            <div className="flex items-center gap-2 mb-3 px-1">
                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 gap-1">
                    <Megaphone className="w-3 h-3" />
                    Pickup
                </Badge>
                <span className="text-sm font-bold text-gray-700">注目のお知らせ</span>
            </div>

            <Carousel
                opts={{ align: "start", loop: true }}
                plugins={[plugin.current]}
                className="w-full"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {safeAnnouncements.map((announcement) => {
                        const imageUrl = announcement.image_url || announcement.media_url;
                        const formattedDate = announcement.created_at
                            ? format(new Date(announcement.created_at), 'MM/dd', { locale: ja })
                            : '-/-';

                        const displayTitle = announcement.title || announcement.content;
                        const isOwner = currentUserId && announcement.user_id === currentUserId;

                        if (announcement.isHidden) {
                            return (
                                <CarouselItem key={announcement.id} className="pl-2 md:pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3">
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col justify-center items-center p-4 transition-all hover:bg-gray-100 min-h-[160px]">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <div className="bg-gray-200 p-3 rounded-full">
                                                <EyeOff className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold">非表示の告知</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 h-8 text-xs font-bold rounded-full border border-indigo-100"
                                                onClick={() => onUnhideAnnouncement?.(announcement.id)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                表示
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 h-8 text-xs font-bold rounded-full border border-red-100"
                                                onClick={() => {
                                                    if (confirm('あなたの画面からこの告知を完全に削除しますか？\n（他の人の画面には影響しません）')) {
                                                        onRemoveAnnouncement?.(announcement.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                削除
                                            </Button>
                                        </div>
                                    </div>
                                </CarouselItem>
                            );
                        }

                        return (
                            <CarouselItem key={announcement.id} className="pl-2 md:pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3">
                                <Dialog
                                    open={openDialogId === announcement.id}
                                    onOpenChange={(open) => {
                                        if (!open) setOpenDialogId(null);
                                    }}
                                >
                                    {/* 🌟 修正：border を消して shadow-md に変更！これで「謎の線」が出なくなる！ */}
                                    <div
                                        className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col hover:shadow-lg transition-all cursor-pointer group/card w-full relative"
                                        onClick={() => setOpenDialogId(announcement.id)}
                                    >
                                        <div className="relative bg-gray-100 w-full">
                                            <AspectRatio ratio={16 / 9}>
                                                {imageUrl ? (
                                                    <img
                                                        src={getOptimizedUrl(imageUrl, 800)}
                                                        alt={displayTitle || '告知画像'}
                                                        className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-500"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-50">
                                                        <Megaphone className="w-10 h-10 opacity-20" />
                                                    </div>
                                                )}
                                            </AspectRatio>

                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 pointer-events-none">
                                                <h3 className="text-white font-bold text-sm line-clamp-2 leading-snug">
                                                    {displayTitle || 'お知らせ'}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="p-3 flex items-center justify-between mt-auto bg-gray-50/50 w-full">
                                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formattedDate}
                                            </span>

                                            <div className="inline-flex items-center justify-center h-7 text-xs gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 rounded-full font-medium transition-colors">
                                                詳細 <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- 詳細ダイアログの中身（変更なし） --- */}
                                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white !fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !w-full !max-w-none !h-[100dvh] !bg-transparent !border-none !shadow-none !p-4 sm:!p-6 !block touch-pan-y [&>button]:hidden">
                                        <div className="w-full sm:max-w-lg mx-auto mt-12 sm:mt-24 mb-24 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
                                            <button
                                                onClick={() => setOpenDialogId(null)}
                                                className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>

                                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
                                                        {announcement.category || 'お知らせ'}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">
                                                        {announcement.created_at && format(new Date(announcement.created_at), 'yyyy年MM月dd日', { locale: ja })}
                                                    </span>
                                                </div>
                                                <DialogTitle className="text-xl font-bold leading-relaxed">
                                                    {announcement.title || 'お知らせ'}
                                                </DialogTitle>
                                                <DialogDescription className="sr-only">お知らせの詳細内容です</DialogDescription>
                                            </div>

                                            <div className="p-4 sm:p-5 space-y-6">
                                                {imageUrl && (
                                                    <div
                                                        className="rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer group relative"
                                                        onClick={() => setViewerImage(imageUrl)}
                                                    >
                                                        <img
                                                            src={getOptimizedUrl(imageUrl, 800)}
                                                            alt={announcement.title || "告知画像"}
                                                            className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                                            <Eye className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="text-sm text-gray-700 leading-7 whitespace-pre-wrap min-h-[100px]">
                                                    {announcement.content}
                                                </div>

                                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                    {!isOwner ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-2"
                                                                onClick={() => {
                                                                    onHideAnnouncement?.(announcement.id);
                                                                    setOpenDialogId(null);
                                                                }}
                                                            >
                                                                <EyeOff className="w-4 h-4 mr-1" />
                                                                非表示
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-orange-600 hover:bg-orange-50 hover:text-orange-700 px-2"
                                                                onClick={() => openReportDialog(announcement.id)}
                                                            >
                                                                <AlertTriangle className="w-4 h-4 mr-1" />
                                                                通報する
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 px-2"
                                                                onClick={() => openEditDialog(announcement)}
                                                            >
                                                                <Edit2 className="w-4 h-4 mr-1" />
                                                                編集する
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2"
                                                                onClick={() => {
                                                                    onDelete?.(announcement.id);
                                                                    setOpenDialogId(null);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-1" />
                                                                削除する
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <Button type="button" variant="outline" onClick={() => setOpenDialogId(null)}>
                                                        閉じる
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>

                <CarouselPrevious className="left-2 w-10 h-10 bg-white/95 border-orange-200 text-orange-500 shadow-md hover:bg-orange-50 hover:text-orange-600 hover:scale-110 active:scale-95 transition-all hidden lg:flex opacity-0 group-hover:opacity-100 z-10" />
                <CarouselNext className="right-2 w-10 h-10 bg-white/95 border-orange-200 text-orange-500 shadow-md hover:bg-orange-50 hover:text-orange-600 hover:scale-110 active:scale-95 transition-all hidden lg:flex opacity-0 group-hover:opacity-100 z-10" />
            </Carousel>

            <Dialog open={!!viewerImage} onOpenChange={(open) => { if (!open) setViewerImage(null); }}>
                <DialogContent className="max-w-4xl w-[95vw] p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center z-[100]">
                    <DialogHeader className="sr-only">
                        <DialogTitle>画像拡大</DialogTitle>
                        <DialogDescription>画像の拡大表示です</DialogDescription>
                    </DialogHeader>

                    <div className="relative w-full flex justify-center items-center">
                        {viewerImage && (
                            <img
                                src={viewerImage}
                                alt="拡大画像"
                                className="max-h-[85vh] max-w-full object-contain rounded-md"
                            />
                        )}
                        <button
                            onClick={() => setViewerImage(null)}
                            className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- 以下、編集・通報ダイアログ（変更なし） --- */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                {/* ... (省略、前回と同じ) ... */}
                {/* ※ここから下は変更がないので、元のコードのままで大丈夫ですが、
                    念のため「詳細ダイアログ」と同じようにスクロール設定を入れておくと完璧です！
                    （今回は量が多いので省略しますが、もし編集画面のスクロールも気になるなら教えてね！）
                 */}
                {/* 今回の修正箇所はここまで！ */}
                <DialogContent className="sm:max-w-md bg-white z-[80]">
                    {/* ...中身は変更なし... */}
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                            <Edit2 className="w-5 h-5" />
                            告知を編集する
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            告知の編集フォーム
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                            placeholder="告知のタイトル"
                        />
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32 text-sm"
                            placeholder="告知の内容"
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
                                    disabled={isEditing || (!editContent.trim() && !editMediaPreview) || !editTitle.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {isEditing ? '保存中...' : '保存する'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isReportOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsReportOpen(false);
                    setReportingAnnouncementId(null);
                }
            }}>
                <DialogContent className="sm:max-w-md bg-white z-[60]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="w-5 h-5" />
                            この告知を通報する
                        </DialogTitle>
                        <DialogDescription>
                            不適切な告知として管理者に報告します。最も近い理由を選んでね！
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
                <DialogContent className="sm:max-w-md bg-white z-[70]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-gray-800">
                            <EyeOff className="w-5 h-5 text-gray-500" />
                            この告知を非表示にしますか？
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            通報ありがとうございます。<br />
                            今後、この告知をあなたの画面に表示しないように設定できます。
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
}