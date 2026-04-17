import { X, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { useProfileEdit } from './useProfileEdit';
import { ImageCropper } from '../ui/ImageCropper';
import { Button } from '../ui/button';

interface ProfileEditModalProps {
    profile: any;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function ProfileEditModal({ profile, isOpen, onClose, onSave }: ProfileEditModalProps) {
    const {
        username, setUsername,
        bio, setBio,
        location, setLocation,
        website, setWebsite,
        loading, updateProfile,
        previewAvatar, previewHeader,
        handleFileSelect,
        cropTarget, setCropTarget,
        tempImageSrc, handleCropComplete
    } = useProfileEdit(profile, onClose, onSave);

    if (!isOpen) return null;

    return (
        // ★ 背景を濃くしてぼかしも入れたよ！透明問題解決！
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">

                <div className="p-4 border-b border-gray-100 flex justify-between items-center z-10 bg-white">
                    <h2 className="text-lg font-bold">プロフィール編集</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {/* 画像編集エリア */}
                    <div className="relative mb-16">
                        {/* ヘッダー画像 */}
                        <div className="h-40 bg-gray-200 relative group cursor-pointer overflow-hidden">
                            {previewHeader ? (
                                <img src={previewHeader} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Header" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-300 to-indigo-400" />
                            )}
                            {/* ★ ホバー時のみ表示 */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <div className="bg-black/50 p-3 rounded-full text-white">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                            </div>
                            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileSelect(e, 'header')} />
                        </div>

                        {/* アバター画像 */}
                        <div className="absolute -bottom-12 left-6">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md relative">
                                    <img src={previewAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Avatar" />
                                    {/* ★ ホバー時のみ表示 */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" onChange={(e) => handleFileSelect(e, 'avatar')} />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-5 mt-2">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">名前</label>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="名前" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">自己紹介</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] resize-none" placeholder="自己紹介" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">場所</label>
                                <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="北海道 江別市" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">ウェブサイト</label>
                                <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <Button onClick={updateProfile} disabled={loading} className="w-full h-12 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : '変更を保存'}
                    </Button>
                </div>
            </div>

            <ImageCropper
                isOpen={!!cropTarget}
                imageSrc={tempImageSrc}
                aspect={cropTarget === 'header' ? 3 / 1 : 1}
                onCancel={() => setCropTarget(null)}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
}