import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { uploadToCloudinary, getPublicIdFromUrl } from '../../lib/cloudinary';

export function useChatScreen(currentUserId: string, selectedRoomId: string | null) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // プレビュー用に選択されたファイルを保持
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // --- メッセージ取得 & リアルタイム接続 ---
    useEffect(() => {
        if (!selectedRoomId) return;

        setLoading(true);

        // 1. 過去ログ取得
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('room_id', selectedRoomId)
                .order('created_at', { ascending: true });
            setMessages(data || []);
            setLoading(false);
        };
        fetchMessages();

        // 2. リアルタイム接続 (この部屋専用！)
        const channel = supabase
            .channel(`room:${selectedRoomId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `room_id=eq.${selectedRoomId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setMessages(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'DELETE') {
                    // 削除されたら、相手の画面でもリストから消す！🗑️
                    setMessages(prev => prev.filter(m => m.id !== payload.old.id));
                } else if (payload.eventType === 'UPDATE') {
                    // 編集されたら、中身をサクッと差し替える！✏️
                    setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedRoomId]);

    // --- 画像選択処理 ---
    const selectImage = useCallback((file: File) => {
        setSelectedFile(file);
    }, []);

    // --- 画像選択クリア ---
    const clearImage = useCallback(() => {
        setSelectedFile(null);
    }, []);

    // --- メッセージ送信処理 ---
    const sendMessage = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        // テキストも画像もなければ何もしない
        if ((!inputText.trim() && !selectedFile) || !selectedRoomId) return;

        // 二重送信防止
        if (isUploading) return;

        setIsUploading(true); // 送信開始！

        try {
            let mediaUrl = null;
            let mediaType = null;

            // 1. 画像があるなら先にアップロード
            if (selectedFile) {
                const result = await uploadToCloudinary(selectedFile);
                if (!result) {
                    setIsUploading(false);
                    return; // 失敗したら止める
                }
                mediaUrl = result.url;
                mediaType = result.type;
            }

            const content = inputText;
            setInputText(''); // テキストクリア
            setSelectedFile(null); // 画像クリア

            // 2. メッセージ保存
            const { error } = await supabase
                .from('messages')
                .insert({
                    room_id: selectedRoomId,
                    user_id: currentUserId,
                    content: content || (mediaUrl ? 'sent a file' : ''), // テキストがなければ代替テキスト
                    media_url: mediaUrl,
                    media_type: mediaType
                });

            if (error) {
                console.error(error);
                toast.error('送信できませんでした💦');
                setInputText(content); // エラーなら戻す
            } else {
                // 3. 部屋の更新時刻を更新
                await supabase
                    .from('rooms')
                    .update({ last_message_at: new Date().toISOString() })
                    .eq('id', selectedRoomId);
            }

        } catch (e) {
            console.error(e);
            toast.error('エラーが発生しました');
        } finally {
            setIsUploading(false); // 送信終了
        }
    }, [inputText, selectedFile, selectedRoomId, currentUserId, isUploading]);

    // --- メッセージ編集処理 ---
    const editMessage = useCallback(async (messageId: string, newContent: string) => {
        if (!newContent.trim()) return; // 空っぽはNG

        try {
            // 先に見た目を変えちゃう（サクサク感重視！）
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));

            const { error } = await supabase
                .from('messages')
                .update({ content: newContent })
                .eq('id', messageId);

            if (error) throw error;
        } catch (e) {
            console.error('編集エラー:', e);
            toast.error('編集に失敗しました💦');
        }
    }, []);

    // --- メッセージ削除処理 ---
    const deleteMessage = useCallback(async (messageId: string, mediaUrl?: string, mediaType?: string) => {
        if (!confirm('このメッセージを削除してもよろしいですか？')) return;

        // 1. 先に見た目から消す（サクサク感）
        setMessages(prev => prev.filter(m => m.id !== messageId));

        try {
            // 2. データベースから削除
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) throw error;

            // 3. Cloudinaryからも削除 (Edge Function呼び出し)
            if (mediaUrl) {
                const publicId = getPublicIdFromUrl(mediaUrl);

                if (publicId) {
                    const resourceType = mediaType === 'video' ? 'video' : 'image';

                    // Edge Function を呼び出して削除依頼
                    await supabase.functions.invoke('delete-cloudinary-image', {
                        body: { public_id: publicId, resource_type: resourceType }
                    });

                    console.log('Cloudinaryからも削除しました🗑️');
                }
            }

        } catch (e) {
            console.error('削除エラー:', e);
            toast.error('削除に失敗しました💦');
        }
    }, []);

    return {
        messages,
        inputText,
        setInputText,
        sendMessage,
        selectImage,
        clearImage,
        selectedFile,
        loading,
        isUploading,
        deleteMessage,
        editMessage
    };
}