import { useState } from 'react';
import {
    ArrowLeft, Edit, MapPin, Link as LinkIcon, Calendar,
    LogOut, UserPlus, UserMinus, ShieldBan, Mail
} from 'lucide-react';
// 重複していた PenTool, ShoppingBag アイコンのインポートは削除しました

import { PostFeed } from '../posts/PostFeed';
import { UserListModal } from '../users/UserListModal';
import { ProfileEditModal } from './ProfileEditModal';
import { useProfile } from '../../hooks/useProfile';
import { useDirectMessage } from '../../hooks/useDirectMessage';

interface ProfileScreenProps {
    targetUserId: string;
    currentUserId: string;
    initialProfile: any;
    onBack: () => void;
    onEdit: () => void;
    onLogout: () => void;
    onUserClick: (userId: string) => void;
    onStartChat?: (roomId: string) => void;
}

export function ProfileScreen({
    targetUserId, currentUserId, initialProfile,
    onBack, onEdit: _unusedOnEdit, onLogout, onUserClick,
    onStartChat
}: ProfileScreenProps) {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const {
        profile,
        loading,
        isFollowing,
        isBlocked,
        followersCount,
        followingCount,
        isListOpen,
        setIsListOpen,
        listType,
        setListType,
        feedRef,
        handleFollow,
        handleBlock,
        refreshProfile
    } = useProfile(targetUserId, currentUserId, initialProfile);

    const { getOrCreateRoom, loading: dmLoading } = useDirectMessage(currentUserId);

    const handleProfileUpdate = async () => {
        await refreshProfile();
        setIsEditModalOpen(false);
    };

    const handleMessageClick = async () => {
        if (!onStartChat) return;
        const roomId = await getOrCreateRoom(targetUserId);
        if (roomId) {
            onStartChat(roomId);
        }
    };

    if (loading && !profile) return <div className="p-8 text-center">読み込み中...</div>;

    const isOwnProfile = currentUserId === targetUserId;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* --- ヘッダー画像 --- */}
            <div className="relative h-48 md:h-64 rounded-b-3xl overflow-hidden shadow-sm bg-gray-200 group">
                {profile?.header_url ? (
                    <img src={profile.header_url} alt="Header" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-300 to-indigo-400" />
                )}
                <button onClick={onBack} className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                {isOwnProfile && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={onLogout} className="bg-black/30 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-sm transition-all">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* --- プロフィール情報 --- */}
            <div className="px-6 md:px-10 relative">
                <div className="flex justify-between items-end -mt-16 mb-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-[#f3f4f6] bg-white overflow-hidden shadow-lg relative z-10">
                            <img src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 text-sm"
                            >
                                <Edit className="w-4 h-4" /> プロフィール編集
                            </button>
                        ) : (
                            <>
                                <button onClick={handleFollow} className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm flex items-center gap-2 ${isFollowing ? 'bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600' : 'bg-black text-white hover:bg-gray-800'}`}>
                                    {isFollowing ? <>フォロー中 <UserMinus className="w-4 h-4" /></> : <>フォローする <UserPlus className="w-4 h-4" /></>}
                                </button>

                                <button
                                    onClick={handleMessageClick}
                                    disabled={dmLoading}
                                    className="p-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm transition-colors flex items-center justify-center disabled:opacity-50"
                                >
                                    <Mail className="w-5 h-5" />
                                </button>

                                <button onClick={handleBlock} className={`p-2 rounded-full border shadow-sm transition-colors ${isBlocked ? 'bg-red-500 text-white border-red-500' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                                    <ShieldBan className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {profile?.username || 'ゲストユーザー'}
                        {profile?.student_id && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-mono">{profile.student_id}</span>}
                    </h1>
                    <p className="text-gray-500 text-sm">@{profile?.id?.substring(0, 8) || 'unknown'}</p>
                </div>

                {profile?.bio && <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>}

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-6">
                    {profile?.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" />{profile.location}</div>}
                    {profile?.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline"><LinkIcon className="w-4 h-4" />{profile.website.replace(/^https?:\/\//, '')}</a>}
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" />2024年4月から利用</div>
                </div>

                <div className="flex gap-6 border-b border-gray-200 pb-4">
                    <button onClick={() => { setListType('following'); setIsListOpen(true); }} className="flex items-center gap-1 hover:underline group">
                        <span className="font-bold text-gray-900">{followingCount}</span><span className="text-gray-500 text-sm group-hover:text-gray-700">フォロー中</span>
                    </button>
                    <button onClick={() => { setListType('followers'); setIsListOpen(true); }} className="flex items-center gap-1 hover:underline group">
                        <span className="font-bold text-gray-900">{followersCount}</span><span className="text-gray-500 text-sm group-hover:text-gray-700">フォロワー</span>
                    </button>
                </div>

                <div className="flex mt-2">
                    <button className="flex-1 py-3 text-center font-bold text-gray-800 border-b-2 border-gray-800 hover:bg-gray-50 transition-colors">ポスト</button>
                    <button className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">メディア</button>
                    <button className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">いいね</button>
                </div>
            </div>

            <div className="bg-white min-h-[400px]">
                {/* PostFeedで投稿を表示し、フローティングボタンもここで表示されます */}
                <PostFeed ref={feedRef} targetUserId={targetUserId} currentUserId={currentUserId} />
            </div>

            {/* ★ ここにあった ProfileScreen 独自のフローティングボタン（ショップ・ポスト）は削除しました */}

            <UserListModal isOpen={isListOpen} onClose={() => setIsListOpen(false)} title={listType === 'followers' ? 'フォロワー' : 'フォロー中'} type={listType} userId={targetUserId} onUserClick={onUserClick} />

            <ProfileEditModal
                profile={profile}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleProfileUpdate}
            />
        </div>
    );
}