import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon, Loader2, Send, X, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { compressImage } from '../../lib/canvasUtils';

interface PostFormProps {
    currentUserId: string;
    onPostSuccess?: (newPost?: any) => void;
    isAnnouncement?: boolean;
}

export function PostForm({ currentUserId, onPostSuccess, isAnnouncement = false }: PostFormProps) {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [isAnnouncementMode, setIsAnnouncementMode] = useState(isAnnouncement);
    const [expiresDate, setExpiresDate] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && !selectedFile && !title.trim()) return;

        setIsSubmitting(true);
        try {
            let mediaUrl = null;
            let mediaType = null;

            if (selectedFile) {
                let fileToUpload = selectedFile;
                if (selectedFile.type.startsWith('image/')) {
                    try {
                        fileToUpload = await compressImage(selectedFile);
                    } catch (err) {
                        console.error("圧縮失敗", err);
                    }
                }

                const result = await uploadToCloudinary(fileToUpload);
                if (result) {
                    mediaUrl = result.url;
                    mediaType = result.type;
                }
            }

            const expiresAtTimestamp = isAnnouncementMode && expiresDate
                ? new Date(`${expiresDate}T23:59:59`).toISOString()
                : null;

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    user_id: currentUserId,
                    title: isAnnouncementMode ? title : null,
                    content: content,
                    media_url: mediaUrl,
                    media_type: mediaType,
                    is_announcement: isAnnouncementMode,
                    expires_at: expiresAtTimestamp
                })
                .select(`
                    *,
                    profiles (username, avatar_url),
                    likes (user_id),
                    comments (id, content, user_id, profiles (username))
                `)
                .single();

            if (error) {
                console.error("🔥投稿保存エラー:", error);
                throw error;
            }

            toast.success(isAnnouncementMode ? '告知を投稿しました！📢' : '投稿しました！✨');

            setContent('');
            setTitle('');
            setSelectedFile(null);
            setIsAnnouncementMode(false);
            setExpiresDate('');
            if (fileInputRef.current) fileInputRef.current.value = '';

            const formattedData = {
                ...data,
                profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
                likes: data.likes || [],
                comments: (data.comments || []).map((c: any) => ({
                    ...c,
                    profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
                }))
            };

            onPostSuccess?.(formattedData);

        } catch (error) {
            console.error("🔥全体の処理エラー:", error);
            toast.error('投稿に失敗しました💦');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        /* 🌟 魔法の修正：背景のスタイルを消して、親コンポーネントにスクロールを委ねる！ */
        < form
            onSubmit={handleSubmit}
            className="flex flex-col relative"
        >
            <div className="flex gap-3">
                <div className="flex-1 space-y-3">

                    {isAnnouncementMode && (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 animate-in fade-in slide-in-from-top-2 space-y-3 shrink-0">
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 mb-1">
                                <Megaphone className="w-4 h-4" /> 告知設定
                            </div>

                            <div>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="告知のタイトル (例: 学園祭のお知らせ)"
                                    className="w-full bg-white border border-orange-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-800 placeholder:font-normal"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 font-medium">掲載期限:</span>
                                <input
                                    type="date"
                                    required={isAnnouncementMode}
                                    value={expiresDate}
                                    onChange={(e) => setExpiresDate(e.target.value)}
                                    className="bg-white border border-orange-200 text-sm rounded px-2 py-1 focus:outline-none focus:border-orange-500 text-gray-700"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <p className="text-[10px] text-orange-400">※ 期限を過ぎると自動で削除されます🗑️</p>
                        </div>
                    )}

                    <textarea
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        placeholder={isAnnouncementMode ? "告知の詳細（本文）を入力してください..." : "今何してる？"}
                        className={`w-full bg-transparent border-none focus:ring-0 resize-none text-base placeholder:text-gray-400 min-h-[100px] ${isAnnouncementMode ? 'text-gray-700' : ''}`}
                        style={{ overflow: 'hidden', touchAction: 'pan-y' }}
                    />

                    {selectedFile && (
                        <div className="relative inline-block shrink-0">
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="preview"
                                className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50 shrink-0">
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsAnnouncementMode(!isAnnouncementMode);
                                    if (!isAnnouncementMode) {
                                        setExpiresDate('');
                                        setTitle('');
                                    }
                                }}
                                className={`p-2 rounded-full transition-colors flex items-center gap-1 ${isAnnouncementMode
                                    ? 'text-orange-500 bg-orange-50 ring-1 ring-orange-200'
                                    : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                                    }`}
                                title="告知として投稿"
                            >
                                <Megaphone className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={(!content.trim() && !selectedFile && !title.trim()) || isSubmitting || (isAnnouncementMode && !expiresDate)}
                            className={`px-4 py-2 rounded-full font-bold text-white text-sm transition-all shadow-md flex items-center gap-2 ${isAnnouncementMode
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    投稿する
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
            />
        </form >
    );
}