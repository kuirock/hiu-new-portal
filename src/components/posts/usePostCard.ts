import { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { compressImage } from '../../lib/canvasUtils';

export const REPORT_REASONS = [
    'スパム・宣伝目的',
    '嫌がらせ・誹謗中傷',
    '不適切な画像・表現',
    '出会い目的',
    'その他'
];

interface UsePostCardProps {
    post: any;
    currentUserId?: string;
    currentUserRole?: string;
    onComment?: (postId: string, comment: string) => void;
    onReport?: (postId: string, reason: string, hideAfterReport: boolean) => Promise<boolean | void>;
    onEditPost?: (postId: string, newContent: string, newMediaUrl?: string | null, newMediaType?: string | null) => Promise<boolean | void>;
}

export function usePostCard({ post, currentUserId, currentUserRole, onComment, onReport, onEditPost }: UsePostCardProps) {
    const isOwner = currentUserId && post.user_id === currentUserId;
    const isAdmin = currentUserRole === 'admin';
    const canDelete = isOwner || isAdmin;
    const canReport = !isOwner && currentUserId;
    const canHide = !isOwner && currentUserId;
    const canEdit = isOwner;
    const isHidden = post.isHidden;

    const likesList = post.likes || [];
    const isLiked = currentUserId ? likesList.some((l: any) => l.user_id === currentUserId) : false;
    const likesCount = likesList.length;
    const commentsList = post.comments || [];
    const commentsCount = commentsList.length;

    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isReportOpen, setIsReportOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
    const [otherReasonText, setOtherReasonText] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const [isHideConfirmOpen, setIsHideConfirmOpen] = useState(false);
    const [reportedReasonTemp, setReportedReasonTemp] = useState('');

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [editMedia, setEditMedia] = useState<File | null>(null);
    const [editMediaPreview, setEditMediaPreview] = useState<string | null>(null);
    const [removeMedia, setRemoveMedia] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🌟🌟🌟 新規追加：画像拡大ビューアー用のステート 🌟🌟🌟
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !onComment) return;

        setIsSubmitting(true);
        try {
            await onComment(post.id, commentText);
            setCommentText('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReportSubmit = async () => {
        const finalReason = selectedReason === 'その他'
            ? `その他: ${otherReasonText}`
            : selectedReason;

        if (!onReport || !finalReason.trim()) return;

        setIsReporting(true);
        try {
            setReportedReasonTemp(finalReason);
            setIsReportOpen(false);
            setIsHideConfirmOpen(true);
        } finally {
            setIsReporting(false);
        }
    };

    const handleFinalizeReport = async (shouldHide: boolean) => {
        if (!onReport || !reportedReasonTemp) return;

        const success = await onReport(post.id, reportedReasonTemp, shouldHide);

        if (success !== false) {
            setIsHideConfirmOpen(false);
            setReportedReasonTemp('');
            setSelectedReason(REPORT_REASONS[0]);
            setOtherReasonText('');
        }
    };

    const openEditDialog = () => {
        setEditContent(post.content || '');
        setEditMediaPreview(post.media_url || null);
        setEditMedia(null);
        setRemoveMedia(false);
        setIsEditOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!onEditPost) return;
        setIsEditing(true);
        try {
            let newMediaUrl: string | null | undefined = undefined;
            let newMediaType: string | null | undefined = undefined;

            if (editMedia) {
                let fileToUpload = editMedia;
                if (editMedia.type.startsWith('image/')) {
                    try {
                        fileToUpload = await compressImage(editMedia);
                    } catch (err) { console.error("圧縮失敗", err); }
                }
                const result = await uploadToCloudinary(fileToUpload);
                if (result) {
                    newMediaUrl = result.url;
                    newMediaType = result.type;
                }
            } else if (removeMedia) {
                newMediaUrl = null;
                newMediaType = null;
            }

            const success = await onEditPost(post.id, editContent, newMediaUrl, newMediaType);
            if (success !== false) {
                setIsEditOpen(false);
            }
        } finally {
            setIsEditing(false);
        }
    };

    return {
        isOwner, canDelete, canReport, canHide, canEdit, isHidden,
        likesCount, isLiked, commentsCount, commentsList,
        isCommentOpen, setIsCommentOpen,
        commentText, setCommentText,
        isSubmitting,
        isReportOpen, setIsReportOpen,
        selectedReason, setSelectedReason,
        otherReasonText, setOtherReasonText,
        isReporting,
        isHideConfirmOpen, setIsHideConfirmOpen,
        isEditOpen, setIsEditOpen,
        editContent, setEditContent,
        isEditing,
        editMediaPreview, setEditMediaPreview, setEditMedia, setRemoveMedia, fileInputRef,
        isImageViewerOpen, setIsImageViewerOpen, // 🌟 追加
        openEditDialog,
        handleSubmitComment, handleReportSubmit, handleFinalizeReport, handleEditSubmit
    };
}