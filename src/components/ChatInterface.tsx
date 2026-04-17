import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { X, Send, Hash, MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
}

type Message = {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    profiles: {
        username: string;
        avatar_url: string;
    } | null; // profilesが取得できない場合も考慮
};

export function ChatInterface({ isOpen, onClose, currentUserId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. メッセージの取得とリアルタイム購読
    useEffect(() => {
        if (!isOpen) return;

        // 最初の読み込み
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) {
                console.error('メッセージ取得エラー:', error);
            } else {
                setMessages(data as any || []);
            }
        };

        fetchMessages();

        // リアルタイム受信 (Discordのような即時反映)
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                async (payload) => {
                    // 新しいメッセージが来たら、送信者のプロフィールも一緒に取ってくる
                    const { data: userData } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', payload.new.user_id)
                        .single();

                    const newMsg = {
                        ...payload.new,
                        profiles: userData
                    } as any;

                    setMessages((prev) => [...prev, newMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen]);

    // 自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 2. メッセージ送信
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const text = newMessage;
        setNewMessage(''); // すぐに空にする

        const { error } = await supabase
            .from('messages')
            .insert({
                content: text,
                user_id: currentUserId,
            });

        if (error) {
            console.error('送信エラー:', error);
            alert('送信できませんでした💦');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 背景クリックで閉じる */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* チャットウィンドウ本体 (Discord風ダークモードっぽくするか、白ベースか) */}
            <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl relative flex overflow-hidden animate-in zoom-in-95 duration-200">

                {/* 左サイドバー (チャンネルリスト風) */}
                <div className="w-64 bg-gray-100 border-r border-gray-200 flex-col hidden md:flex">
                    <div className="p-4 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        学生ラウンジ
                    </div>
                    <div className="p-3 space-y-1">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 rounded-md cursor-pointer font-medium">
                            <Hash className="w-4 h-4 text-gray-500" />
                            general
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                            <Hash className="w-4 h-4" />
                            random
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                            <Hash className="w-4 h-4" />
                            questions
                        </div>
                    </div>
                </div>

                {/* メインチャットエリア */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* ヘッダー */}
                    <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-2">
                            <Hash className="w-5 h-5 text-gray-400" />
                            <span className="font-bold text-gray-800">general</span>
                            <span className="text-xs text-gray-400 ml-2">誰でも自由に話せる場所</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* タイムライン */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-300 mt-10">
                                <p>まだメッセージはありません。<br />一番乗りで挨拶しよう！👋</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.user_id === currentUserId;
                                return (
                                    <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''}`}>
                                        {/* アバター */}
                                        <div className="shrink-0">
                                            <img
                                                src={msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user_id}`}
                                                alt="User"
                                                className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 object-cover"
                                            />
                                        </div>

                                        {/* メッセージ内容 */}
                                        <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-bold text-sm text-gray-700">
                                                    {msg.profiles?.username || '名無しさん'}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={`py-2 px-4 rounded-2xl text-sm leading-relaxed ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 入力エリア */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="#general へメッセージを送信"
                                    className="w-full bg-gray-100 text-gray-800 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}