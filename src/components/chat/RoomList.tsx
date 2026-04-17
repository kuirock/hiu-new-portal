import { MessageCircle } from 'lucide-react';
import { useRoomList } from './useRoomList'; // 👈 自作フックを使う

interface RoomListProps {
    currentUserId: string;
    onSelectRoom: (roomId: string) => void;
    activeRoomId?: string;
}

export function RoomList({ currentUserId, onSelectRoom, activeRoomId }: RoomListProps) {
    // ロジックはこれ1行だけ！
    const { rooms, loading } = useRoomList(currentUserId);

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-100">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-500" />
                メッセージ
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
                {loading && <div className="p-4 text-xs text-center text-gray-400">読み込み中...</div>}

                {!loading && rooms.length === 0 && (
                    <div className="p-4 text-xs text-center text-gray-400">
                        まだメッセージはありません
                    </div>
                )}

                {rooms.map(room => (
                    <div
                        key={room.id}
                        onClick={() => onSelectRoom(room.id)}
                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeRoomId === room.id ? 'bg-indigo-50 border-r-4 border-r-indigo-500' : ''
                            }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                            <img
                                src={room.otherProfile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'}
                                className="w-full h-full object-cover"
                                alt="Avatar"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="font-bold text-sm text-gray-800 truncate">{room.otherProfile.username}</p>
                                {/* 日付とか入れたい場合はここで room.last_message_at を使う */}
                            </div>
                            <p className="text-xs text-gray-400 truncate">タップして会話を開く</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}