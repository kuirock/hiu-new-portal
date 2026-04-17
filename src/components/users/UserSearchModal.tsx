import { Search, X, User, Loader2 } from 'lucide-react';
import { useUserSearch } from './useUserSearch';

interface UserSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (userId: string) => void;
}

export function UserSearchModal({ isOpen, onClose, onSelectUser }: UserSearchModalProps) {
    const {
        query,
        setQuery,
        results,
        loading,
        handleSearch
    } = useUserSearch();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                <div className="p-4 border-b bg-indigo-600">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Search className="w-5 h-5" /> ユーザー検索
                        </h3>
                        <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="名前や学籍番号で検索..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/50 transition-all"
                            autoFocus
                        />
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-white/60" />
                        <button type="submit" className="absolute right-2 top-2 bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
                            検索
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => { onSelectUser(user.id); onClose(); }}
                                    className="w-full bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><User className="w-6 h-6" /></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 group-hover:text-indigo-600">{user.username}</div>
                                        <div className="text-xs text-gray-500 font-mono">@{user.student_id}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-10 text-sm">
                            ユーザーが見つかりません👻
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}