import { useState, useRef, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import { REPORT_REASONS } from './usePostCard';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { compressImage } from '../../lib/canvasUtils';

interface UseAnnouncementCarouselProps {
    onReport?: (postId: string, reason: string, hideAfterReport: boolean, isAnnouncement: boolean) => Promise<boolean | void>;
    onEditAnnouncement?: (announcementId: string, newContent: string, newTitle?: string, newMediaUrl?: string | null, newMediaType?: string | null) => Promise<boolean | void>;
}

export function useAnnouncementCarousel({ onReport, onEditAnnouncement }: UseAnnouncementCarouselProps) {
    const [openDialogId, setOpenDialogId] = useState<string | null>(null);

    const [isReportOpen, setIsReportOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
    const [otherReasonText, setOtherReasonText] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [reportingAnnouncementId, setReportingAnnouncementId] = useState<string | null>(null);

    const [isHideConfirmOpen, setIsHideConfirmOpen] = useState(false);
    const [reportedReasonTemp, setReportedReasonTemp] = useState('');

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [editMedia, setEditMedia] = useState<File | null>(null);
    const [editMediaPreview, setEditMediaPreview] = useState<string | null>(null);
    const [removeMedia, setRemoveMedia] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🌟🌟🌟 新規追加：画像拡大ビューアー用のステート 🌟🌟🌟
    // （どの画像を拡大しているかを覚えておくための箱！）
    const [viewerImage, setViewerImage] = useState<string | null>(null);

    const plugin = useRef(
        Autoplay({
            delay: 4000,
            stopOnInteraction: false,
            stopOnMouseEnter: false
        })
    );

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    plugin.current.play();
                } else {
                    plugin.current.stop();
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleReportSubmit = async () => {
        const finalReason = selectedReason === 'その他'
            ? `その他: ${otherReasonText}`
            : selectedReason;

        if (!onReport || !finalReason.trim() || !reportingAnnouncementId) return;

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
        if (!onReport || !reportedReasonTemp || !reportingAnnouncementId) return;

        const success = await onReport(reportingAnnouncementId, reportedReasonTemp, shouldHide, true);

        if (success !== false) {
            setIsHideConfirmOpen(false);
            setReportedReasonTemp('');
            setSelectedReason(REPORT_REASONS[0]);
            setOtherReasonText('');
            setOpenDialogId(null);
        }
    };

    const handleEditSubmit = async () => {
        if (!onEditAnnouncement || !editingAnnouncementId || !editContent.trim() || !editTitle.trim()) return;
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

            const success = await onEditAnnouncement(editingAnnouncementId, editContent, editTitle, newMediaUrl, newMediaType);
            if (success !== false) {
                setIsEditOpen(false);
                setOpenDialogId(null);
            }
        } finally {
            setIsEditing(false);
        }
    };

    const openEditDialog = (announcement: any) => {
        setEditingAnnouncementId(announcement.id);
        setEditTitle(announcement.title || '');
        setEditContent(announcement.content || '');
        setEditMediaPreview(announcement.media_url || null);
        setEditMedia(null);
        setRemoveMedia(false);
        setIsEditOpen(true);
    };

    const openReportDialog = (announcementId: string) => {
        setReportingAnnouncementId(announcementId);
        setIsReportOpen(true);
    };

    return {
        openDialogId, setOpenDialogId,
        isReportOpen, setIsReportOpen,
        selectedReason, setSelectedReason,
        otherReasonText, setOtherReasonText,
        isReporting, reportingAnnouncementId, setReportingAnnouncementId,
        isHideConfirmOpen, setIsHideConfirmOpen,
        isEditOpen, setIsEditOpen,
        editingAnnouncementId, setEditingAnnouncementId,
        editTitle, setEditTitle,
        editContent, setEditContent,
        isEditing,
        editMediaPreview, setEditMediaPreview, setEditMedia, setRemoveMedia, fileInputRef,
        viewerImage, setViewerImage, // 🌟 追加！
        plugin, containerRef,
        handleReportSubmit, handleFinalizeReport, handleEditSubmit,
        openEditDialog, openReportDialog,
        REPORT_REASONS
    };
}