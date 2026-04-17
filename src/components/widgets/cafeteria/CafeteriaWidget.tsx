import { useState } from 'react';
import { Utensils, Settings } from 'lucide-react';
import { useCafeteriaMenu } from './useCafeteriaMenu';
import { CafeteriaEditor } from './CafeteriaEditor';

interface CafeteriaWidgetProps {
    profile: any;
}

export function CafeteriaWidget({ profile }: CafeteriaWidgetProps) {
    const { todayMenu, loading, fetchTodayMenu } = useCafeteriaMenu();
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const isAdmin = profile?.role === 'admin';

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-center h-full min-h-[100px] animate-pulse">
                <div className="w-8 h-8 bg-gray-100 rounded-full" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm relative overflow-hidden group h-full flex flex-col min-h-[100px]">

            {/* 背景装飾 */}
            <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity rotate-12 pointer-events-none text-orange-500">
                <Utensils className="w-24 h-24" />
            </div>

            {/* ヘッダー */}
            <div className="flex items-center justify-between relative z-10 mb-2">
                <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-orange-500" />
                    LUNCH MENU
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsEditorOpen(true)}
                        className="p-1 -mr-1 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* メニューリスト */}
            <div className="flex-1 flex flex-col justify-center gap-1.5 relative z-10">
                {!todayMenu || (!todayMenu.menu_a && !todayMenu.menu_b && !todayMenu.menu_bowl) ? (
                    <div className="text-center text-xs font-bold text-gray-300 py-2">
                        今日のメニューはありません 🍽️
                    </div>
                ) : (
                    <>
                        {todayMenu.menu_a && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white bg-orange-400 px-1.5 rounded-sm shrink-0">A</span>
                                <span className="text-xs font-bold text-gray-700 truncate">{todayMenu.menu_a}</span>
                            </div>
                        )}
                        {todayMenu.menu_b && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white bg-red-400 px-1.5 rounded-sm shrink-0">B</span>
                                <span className="text-xs font-bold text-gray-700 truncate">{todayMenu.menu_b}</span>
                            </div>
                        )}
                        {todayMenu.menu_bowl && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white bg-blue-400 px-1.5 rounded-sm shrink-0">丼</span>
                                <span className="text-xs font-bold text-gray-700 truncate">{todayMenu.menu_bowl}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* 下線アクセント */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 opacity-50" />

            <CafeteriaEditor
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    fetchTodayMenu(); // 編集終わったら更新
                }}
            />
        </div>
    );
}