import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Loader2, Image as ImageIcon, X, Trash2, Pencil } from 'lucide-react';
import { RoomList } from './RoomList';
import { useChatScreen } from './useChatScreen';
import { getOptimizedUrl } from '../../lib/cloudinary';

interface ChatScreenProps {
    currentUserId: string;
    onBack: () => void;
    initialRoomId?: string | null;
}

export function ChatScreen({ currentUserId, onBack, initialRoomId }: ChatScreenProps) {
    // 選択中のルームID
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);

    // スマホ表示時の切り替えフラグ
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

    // 🌟 編集用の状態を追加！
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // カスタムフックからロジックを受け取る
    const {
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
    } = useChatScreen(currentUserId, selectedRoomId);

    // 外部からルーム指定があった場合（プロフィールから飛んできた時など）
    useEffect(() => {
        if (initialRoomId) {
            setSelectedRoomId(initialRoomId);
            setIsMobileListVisible(false);
        }
    }, [initialRoomId]);

    // 新しいメッセージが来たら自動スクロール
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            selectImage(e.target.files[0]);
            e.target.value = '';
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* --- 左側：ルームリスト --- */}
            <div className={`w-full md:w-80 border-r border-gray-100 bg-white flex-col ${selectedRoomId && !isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-2 md:hidden">
                    <button onClick={onBack} className="flex items-center text-gray-500 text-sm gap-1 hover:text-gray-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> ホームに戻る
                    </button>
                </div>
                <RoomList
                    currentUserId={currentUserId}
                    activeRoomId={selectedRoomId || undefined}
                    onSelectRoom={(id) => {
                        setSelectedRoomId(id);
                        setIsMobileListVisible(false);
                    }}
                />
            </div>

            {/* --- 右側：チャット画面 --- */}
            <div className={`flex-1 flex flex-col bg-[#f8fafc] ${!selectedRoomId && isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
                {!selectedRoomId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                        <span className="text-4xl">👋</span>
                        <p>左のリストから会話を選んでね</p>
                    </div>
                ) : (
                    <>
                        {/* ヘッダー（スマホ用） */}
                        <div className="p-3 bg-white border-b border-gray-100 flex items-center gap-2 md:hidden shadow-sm z-10 sticky top-0">
                            <button onClick={() => setIsMobileListVisible(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <span className="font-bold text-gray-700">チャット</span>
                        </div>

                        {/* メッセージ表示エリア */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading && messages.length === 0 && (
                                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" /></div>
                            )}

                            {messages.map((msg) => {
                                const isMe = msg.user_id === currentUserId;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>

                                        <div className="flex items-end gap-2 max-w-[85%]">

                                            {/* ゴミ箱＆編集ボタン */}
                                            {isMe && (
                                                <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(msg.id);
                                                            setEditContent(msg.content || '');
                                                        }}
                                                        className="p-1.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all"
                                                        title="編集"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMessage(msg.id, msg.media_url, msg.media_type)}
                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                        title="削除"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* メッセージ本体 */}
                                            <div className={`shadow-sm transition-all ${isMe
                                                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                                                } ${msg.media_url ? 'p-1 overflow-hidden' : 'px-4 py-2.5'}`}>

                                                {/* 🌟 編集モードの時は入力欄を出す！ */}
                                                {editingId === msg.id ? (
                                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full bg-white/20 text-white border border-white/30 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-white resize-none"
                                                            rows={2}
                                                            autoFocus
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="text-xs bg-black/10 hover:bg-black/20 px-2 py-1 rounded transition-colors"
                                                            >
                                                                キャンセル
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    editMessage(msg.id, editContent);
                                                                    setEditingId(null);
                                                                }}
                                                                className="text-xs bg-white text-indigo-600 hover:bg-gray-100 px-3 py-1 rounded font-bold shadow-sm transition-colors"
                                                            >
                                                                保存
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* 画像・動画表示 */}
                                                        {msg.media_url && (
                                                            <div className="relative mb-1">
                                                                {msg.media_type === 'video' ? (
                                                                    <video
                                                                        src={msg.media_url}
                                                                        controls
                                                                        className="max-w-full rounded-lg max-h-64 object-cover"
                                                                    />
                                                                ) : (
                                                                    <a href={msg.media_url} target="_blank" rel="noopener noreferrer">
                                                                        <img
                                                                            src={getOptimizedUrl(msg.media_url, 400)}
                                                                            alt="attachment"
                                                                            className="max-w-full rounded-lg max-h-64 object-cover"
                                                                            loading="lazy"
                                                                        />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* テキスト表示 */}
                                                        {msg.content && msg.content !== 'sent a file' && (
                                                            <div className={`text-sm ${msg.media_url ? 'px-2 pb-1' : ''}`}>{msg.content}</div>
                                                        )}

                                                        {/* 時刻表示 */}
                                                        <div className={`text-[10px] mt-1 flex justify-end gap-1 ${isMe ? 'text-indigo-200 mr-1' : 'text-gray-300 ml-1'} ${msg.media_url ? 'mr-2 mb-1' : ''}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}

                            {/* 送信中の表示 */}
                            {isUploading && (
                                <div className="flex justify-end">
                                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm flex items-center gap-2 opacity-80">
                                        <Loader2 className="w-3 h-3 animate-spin" /> 送信中...
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* 入力エリア */}
                        <div className="bg-white border-t border-gray-100 z-20">

                            {/* プレビュー表示 */}
                            {selectedFile && (
                                <div className="p-3 px-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
                                            {selectedFile.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(selectedFile)}
                                                    className="w-full h-full object-cover"
                                                    alt="Preview"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">Video</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]">{selectedFile.name}</p>
                                            <p className="text-[10px] text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={clearImage}
                                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* 入力フォーム */}
                            <div className="p-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                />

                                <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto items-end">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading || !!selectedFile}
                                        className={`p-3 rounded-full transition-colors ${selectedFile
                                            ? 'text-indigo-500 bg-indigo-50'
                                            : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50'
                                            }`}
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>

                                    <input
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder={selectedFile ? "写真についてコメント..." : "メッセージを入力..."}
                                        className="flex-1 bg-gray-100 border-0 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        disabled={isUploading}
                                    />

                                    <button
                                        type="submit"
                                        disabled={(!inputText.trim() && !selectedFile) || isUploading}
                                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md flex items-center justify-center min-w-[44px]"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}