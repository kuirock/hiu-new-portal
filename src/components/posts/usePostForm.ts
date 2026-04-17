import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function usePostForm(onSuccess?: () => void) {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

    // ★ 追加: 告知用の期間設定
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 7))); // デフォルトは1週間後

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent, isAnnouncement: boolean = false) => {
        e.preventDefault();

        // バリデーション
        if (isAnnouncement && !title.trim()) {
            return toast.error('タイトルを入力してね！📢');
        }
        if (!content.trim() && !media) {
            return toast.error('なにか入力してね！✍️');
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('ログインしてないみたい💦');

            let mediaUrl = null;
            let type = null;

            // 画像・動画アップロード
            if (media) {
                const formData = new FormData();
                formData.append('file', media);
                formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

                const resourceType = media.type.startsWith('video/') ? 'video' : 'image';
                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
                    { method: 'POST', body: formData }
                );

                if (!res.ok) throw new Error('アップロード失敗...');
                const data = await res.json();
                mediaUrl = data.secure_url;
                type = resourceType;
            }

            // DBへ保存
            const { error } = await supabase.from('posts').insert({
                user_id: user.id,
                content: content,
                title: isAnnouncement ? title : null,
                media_url: mediaUrl,
                media_type: type,
                is_announcement: isAnnouncement,
                // ★ 期間も保存（テーブルにカラムがない場合は追加してね！）
                start_date: isAnnouncement ? startDate?.toISOString() : null,
                end_date: isAnnouncement ? endDate?.toISOString() : null,
            });

            if (error) throw error;

            toast.success(isAnnouncement ? '告知を作成しました！🎉' : '投稿しました！✨');

            // リセット処理
            setContent('');
            setTitle('');
            setMedia(null);
            setMediaPreview(null);
            setMediaType(null);
            setStartDate(new Date());
            setEndDate(new Date(new Date().setDate(new Date().getDate() + 7)));

            onSuccess?.();

        } catch (error) {
            console.error(error);
            toast.error('エラーが発生しました😢');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMedia(file);
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            setMediaType(type);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const clearMedia = () => {
        setMedia(null);
        setMediaPreview(null);
        setMediaType(null);
    };

    return {
        content, setContent,
        title, setTitle,
        media, mediaPreview, mediaType,
        startDate, setStartDate, // ★ 追加
        endDate, setEndDate,     // ★ 追加
        loading,
        handleFileSelect,
        clearMedia,
        handleSubmit
    };
}