import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// Cloudinaryの設定
const CLOUD_NAME = "deerjcn9u";
const UPLOAD_PRESET = "rupp0qbo";

export type CropTarget = 'avatar' | 'header' | null;

// URLからPublic ID (ファイル名) を取り出す関数
const extractPublicId = (url: string | null) => {
    if (!url) return null;
    try {
        const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch (e) {
        console.error('Failed to extract public id', e);
        return null;
    }
};

export function useProfileEdit(user: any, onClose: () => void, onUpdate: () => void) {
    // 基本情報
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');

    // 画像編集用のState
    const [cropTarget, setCropTarget] = useState<CropTarget>(null);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    // アップロード用に保持するBlobデータ
    const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
    const [headerBlob, setHeaderBlob] = useState<Blob | null>(null);

    // 表示用のプレビューURL
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [previewHeader, setPreviewHeader] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    // 初期値をセット
    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setBio(user.bio || '');
            setLocation(user.location || '');
            setWebsite(user.website || '');
            setPreviewAvatar(user.avatar_url);
            setPreviewHeader(user.header_url);
        }
    }, [user]);

    // ファイル選択時の処理
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'header') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTempImageSrc(url);
            setCropTarget(target);
            e.target.value = '';
        }
    };

    // クロップ完了時の処理
    const handleCropComplete = (blob: Blob) => {
        const url = URL.createObjectURL(blob);

        if (cropTarget === 'avatar') {
            setAvatarBlob(blob);
            setPreviewAvatar(url);
        } else if (cropTarget === 'header') {
            setHeaderBlob(blob);
            setPreviewHeader(url);
        }

        setCropTarget(null);
        setTempImageSrc(null);
    };

    const uploadImageToCloudinary = async (file: Blob) => {
        const formData = new FormData();
        formData.append('file', file, 'image.jpg');
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`画像のアップロード失敗: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await res.json();
        return data.secure_url;
    };

    // 古い画像を削除する関数
    const deleteOldImage = async (url: string) => {
        const publicId = extractPublicId(url);
        if (!publicId) return;

        try {
            await supabase.functions.invoke('delete-cloudinary-image', {
                body: { public_id: publicId }
            });
        } catch (error) {
            console.error('画像の削除リクエストに失敗しました (無視して続行)', error);
        }
    };

    const updateProfile = async () => {
        setLoading(true);
        try {
            let newAvatarUrl = user?.avatar_url;
            let newHeaderUrl = user?.header_url;

            // 1. 画像が変更されていればアップロード & 古い画像の削除予約
            const oldAvatarUrl = user?.avatar_url;
            const oldHeaderUrl = user?.header_url;

            if (avatarBlob) {
                newAvatarUrl = await uploadImageToCloudinary(avatarBlob);
                // ★ await をつけて確実に実行するようにしたよ！
                if (oldAvatarUrl) await deleteOldImage(oldAvatarUrl);
            }
            if (headerBlob) {
                newHeaderUrl = await uploadImageToCloudinary(headerBlob);
                // ★ await をつけて確実に実行するようにしたよ！
                if (oldHeaderUrl) await deleteOldImage(oldHeaderUrl);
            }

            // 2. データベース更新
            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    bio,
                    location,
                    website,
                    avatar_url: newAvatarUrl,
                    header_url: newHeaderUrl,
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success('プロフィールを更新しました！✨');
            onUpdate(); // 画面を更新！
            onClose();  // モーダルを閉じる！

            // ★ ここにあった finally { setLoading(false) } を消したよ！
            // 成功したら画面が閉じるから、ローディングを戻す必要がないんだ👍

        } catch (error: any) {
            console.error('Profile Update Error:', error);
            toast.error(error.message || 'エラーが発生しました🙇‍♀️');

            // ★ エラーの時だけローディングを解除して、画面に残るようにしたよ！
            setLoading(false);
        }
    };

    return {
        username, setUsername,
        bio, setBio,
        location, setLocation,
        website, setWebsite,
        loading,
        updateProfile,
        previewAvatar,
        previewHeader,
        handleFileSelect,
        cropTarget,
        setCropTarget,
        tempImageSrc,
        handleCropComplete
    };
}