import { toast } from 'sonner';

// Cloudinaryの設定（環境変数から取るのがベストだけど、一旦直書きか既存の設定を使ってね）
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'deerjcn9u';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'rupp0qbo';

export async function uploadToCloudinary(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();

        // 成功したら URL と タイプ(image/video) を返す
        return {
            url: data.secure_url,
            type: data.resource_type, // 'image' or 'video'
        };
    } catch (error) {
        console.error('Upload Error:', error);
        toast.error('アップロードに失敗しました💦');
        return null;
    }
}

// 🖼️ 画像を軽くして表示するためのURL変換関数
// width: 表示する幅 (px)
export function getOptimizedUrl(url: string | undefined, width: number = 400) {
    if (!url) return '';
    if (!url.includes('cloudinary')) return url; // Cloudinaryじゃない画像はそのまま

    // /upload/ の後ろにリサイズ設定を挟み込む魔法✨
    // f_auto: スマホに合わせて最適な形式(WebPなど)に変換
    // q_auto: 画質を落とさずに容量を激減させる
    // w_xxx: 幅を指定してリサイズ
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
}

// 👇 usePostFeed.ts からお引越ししてきた関数
export const getPublicIdFromUrl = (url: string) => {
    if (!url || !url.includes('cloudinary')) return null;
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let publicIdWithExt = parts[1];
    if (publicIdWithExt.startsWith('v')) {
        const index = publicIdWithExt.indexOf('/');
        if (index !== -1) publicIdWithExt = publicIdWithExt.substring(index + 1);
    }
    return publicIdWithExt.split('.')[0];
};