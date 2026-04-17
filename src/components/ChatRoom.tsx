import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, MessageSquare, X, User } from 'lucide-react';

interface Message {
    id: number;
    content: string;
    username: string;
    user_id: string;
    created_at: string;
}

interface ChatRoomProps {
    currentUserId: string;
    currentUserName: string;
    onClose: () => void;
    onUserClick: (userId: string) => void; // 👈 クリック機能を追加！
}

export function ChatRoom({ currentUserId, currentUserName, onClose, onUserClick }: ChatRoomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    // ユーザーのアイコン情報をキャッシュしておく場所
    const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50);

            if (data) {
                setMessages(data);
                // メッセージに含まれるユーザーIDを集めて、アイコンを一括取得！
                fetchUserAvatars(data);
            }
        };

        fetchMessages();

        const channel = supabase
            .channel('public-chat')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);
                    // 新しい発言者のアイコンも取得
                    fetchUserAvatars([newMsg]);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // アバター画像をまとめて取得する関数
    const fetchUserAvatars = async (msgs: Message[]) => {
        const userIds = [...new Set(msgs.map(m => m.user_id))];
        // まだ取得してないIDだけフィルタリング
        const unknownIds = userIds.filter(id => !userAvatars[id]);

        if (unknownIds.length === 0) return;

        const { data } = await supabase
            .from('profiles')
            .select('id, avatar_url')
            .in('id', unknownIds);

        if (data) {
            const newAvatars: Record<string, string> = {};
            data.forEach((profile) => {
                if (profile.avatar_url) {
                    newAvatars[profile.id] = profile.avatar_url;
                }
            });
            setUserAvatars(prev => ({ ...prev, ...newAvatars }));
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const { error } = await supabase
            .from('messages')
            .insert([{ content: newMessage, user_id: currentUserId, username: currentUserName }]);

        if (!error) setNewMessage('');
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 z-50">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> みんなの広場
                </h3>
                <button onClick={onClose} className="hover:bg-indigo-500 rounded p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => {
                    const isMe = msg.user_id === currentUserId;
                    const avatarUrl = userAvatars[msg.user_id];

                    return (
                        <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* 👤 アイコン (クリック可能！) */}
                            <button
                                onClick={() => onUserClick(msg.user_id)}
                                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300 hover:scale-110 transition-transform"
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={msg.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </button>

                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                <span className="text-xs text-gray-500 mb-1 px-1">{msg.username}</span>
                                <div className={`px-4 py-2 rounded-2xl text-sm break-all ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージ..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}