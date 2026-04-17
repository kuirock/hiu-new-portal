import { X } from 'lucide-react';
import { useUserList } from './useUserList';

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string; // オプショナルに変更
    userId: string;
    currentUserId?: string; // ProfileScreenに合わせて追加
    type: 'followers' | 'following';
    onUserClick: (userId: string) => void;
}

export function UserListModal({ isOpen, onClose, title, userId, type, onUserClick }: UserListModalProps) {
    const { users, loading } = useUserList(isOpen, userId, type);

    if (!isOpen) return null;

    const displayTitle = title || (type === 'followers' ? 'フォロワー' : 'フォロー中');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-lg text-gray-800">{displayTitle}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">読み込み中...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">ユーザーはいません</div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => { onUserClick(user.id); onClose(); }}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shrink-0">
                                        <img src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{user.username || '名無し'}</h4>
                                        <p className="text-xs text-gray-500">@{user.student_id || 'guest'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}