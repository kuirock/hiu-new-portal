import { Plus, X, RotateCcw, Globe, Check } from 'lucide-react';
import { useLinkGrid, AVAILABLE_ICONS, AVAILABLE_COLORS } from './useLinkGrid';
import './LinkGrid.css';
import { Portal } from '../ui/Portal';

interface LinkGridProps {
    userId: string;
}

export function LinkGrid({ userId }: LinkGridProps) {
    const {
        links,
        isEditing,
        setIsEditing,
        isModalOpen,
        setIsModalOpen,
        newTitle,
        setNewTitle,
        newUrl,
        setNewUrl,
        newIcon,
        setNewIcon,
        newColor,
        setNewColor,
        containerRef,
        handleAddLink,
        handleDeleteLink,
        handleResetLinks,
        activeId,
        dragPosition,
        touchOffset,
        handleDragStart
    } = useLinkGrid(userId);

    // アイコン取得
    const getIconComponent = (iconName: string) => {
        const Icon = AVAILABLE_ICONS[iconName] || Globe;
        return <Icon className="w-8 h-8 text-white drop-shadow-md" />;
    };

    // 掴んでいるアイテムのデータ
    const activeLink = links.find(l => l.id === activeId);

    return (
        <div className="mt-6 pb-20" ref={containerRef}>
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-gray-700">クイックアクセス</h3>
                {isEditing && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                        <button
                            onClick={handleResetLinks}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full font-bold transition-colors flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" /> 初期化
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-xs bg-gray-800 hover:bg-black text-white px-4 py-1 rounded-full font-bold transition-colors shadow-sm"
                        >
                            完了
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 relative">
                {links.map((link, index) => (
                    <div
                        key={link.id}
                        data-sort-item
                        data-index={index}
                        // タッチ・マウス開始 (HTML5のdraggableは使わない)
                        onTouchStart={(e) => handleDragStart(e, link.id, index)}
                        onMouseDown={(e) => handleDragStart(e, link.id, index)}

                        className={`flex flex-col items-center gap-2 group relative transition-all duration-200 rounded-2xl
                            ${isEditing ? 'cursor-move touch-none' : 'cursor-pointer hover:scale-105'}
                            ${activeId === link.id ? 'opacity-0' : ''} 
                            ${isEditing && activeId !== link.id ? 'animate-shake' : ''}
                        `}
                        // 編集モード中は誤操作防止のスタイル適用（CSSクラスがない場合の保険）
                        style={isEditing ? { touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' } : undefined}
                    >
                        <a
                            href={isEditing ? undefined : link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => isEditing && e.preventDefault()}
                            draggable={false} // 画像ドラッグ防止
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md relative transition-transform ${isEditing ? 'pointer-events-none' : ''}`}
                        >
                            {getIconComponent(link.icon)}

                            {/* 削除ボタン */}
                            {isEditing && (
                                <div className="absolute -top-2 -left-2 z-20 pointer-events-auto">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (confirm('このアプリを削除しますか？')) handleDeleteLink(link.id);
                                        }}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="bg-gray-400 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors shadow-sm delete-btn"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </a>

                        <span className="text-[10px] font-medium text-gray-600 text-center leading-tight line-clamp-2 w-full select-none">
                            {link.title}
                        </span>
                    </div>
                ))}

                {/* 追加ボタン */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-col items-center gap-2 group cursor-pointer hover:scale-105 transition-transform"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-indigo-300 group-hover:text-indigo-400 transition-colors">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 group-hover:text-indigo-400">追加</span>
                </button>
            </div>

            {/* ★ Drag Overlay (浮いているアイコン) */}
            {activeId && activeLink && (
                <Portal>
                    <div
                        className="fixed z-[9999] pointer-events-none touch-none select-none flex flex-col items-center gap-2 will-change-transform"
                        style={{
                            left: 0, top: 0,
                            width: '80px', // グリッドアイテムのおおよその幅
                            transform: `translate(${dragPosition.x - touchOffset.x}px, ${dragPosition.y - touchOffset.y}px) scale(1.1)`,
                        }}
                    >
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeLink.color} flex items-center justify-center shadow-2xl ring-4 ring-indigo-400/50`}>
                            {getIconComponent(activeLink.icon)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-800 text-center leading-tight bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {activeLink.title}
                        </span>
                    </div>
                </Portal>
            )}

            {/* 追加モーダル (ほぼ変更なし) */}
            {isModalOpen && (
                <Portal>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                        <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
                        <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 relative z-10 flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h3 className="text-xl font-bold text-gray-800">アプリを追加</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-4 overflow-y-auto px-1 custom-scrollbar">
                                <div className="flex justify-center mb-6">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${newColor} flex items-center justify-center shadow-lg transition-all`}>
                                            {getIconComponent(newIcon)}
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">{newTitle || 'アプリ名'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">名前</label>
                                        <input
                                            placeholder="例: Moodle"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">URL</label>
                                        <input
                                            placeholder="https://..."
                                            value={newUrl}
                                            onChange={(e) => setNewUrl(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 mb-2 block ml-1">アイコン</label>
                                    <div className="flex gap-2 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide">
                                        {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                                            const Icon = AVAILABLE_ICONS[iconName];
                                            return (
                                                <button
                                                    key={iconName}
                                                    onClick={() => setNewIcon(iconName)}
                                                    className={`p-3 rounded-xl border-2 transition-all shrink-0 ${newIcon === iconName ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm scale-105' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 mb-2 block ml-1">カラー</label>
                                    <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide">
                                        {AVAILABLE_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setNewColor(color)}
                                                className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} shrink-0 ring-offset-2 transition-all ${newColor === color ? 'ring-2 ring-gray-400 scale-110 shadow-md' : 'hover:scale-105'}`}
                                            >
                                                {newColor === color && <Check className="w-5 h-5 text-white/90 mx-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddLink}
                                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-4 active:scale-95"
                                >
                                    追加する
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}