import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Loader2, AlertCircle } from 'lucide-react';
import { useCafeteriaMenu, type DailyMenu, getLocalDateStr } from './useCafeteriaMenu';

interface CafeteriaEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CafeteriaEditor({ isOpen, onClose }: CafeteriaEditorProps) {
    // ★ saveBulkMenus を受け取る
    const { monthlyMenus, currentMonth, moveMonth, saveBulkMenus, loading } = useCafeteriaMenu();

    // 編集用の一時データ (変更された行だけここに溜まっていくよ)
    const [editData, setEditData] = useState<Record<string, DailyMenu>>({});
    const [isSaving, setIsSaving] = useState(false);

    // その月の日付リストを生成
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
        return {
            date: getLocalDateStr(d),
            dayLabel: d.toLocaleDateString('ja-JP', { weekday: 'short' }),
            isWeekend: d.getDay() === 0 || d.getDay() === 6
        };
    });

    // 既に登録されているデータを探す関数
    const getMenu = (dateStr: string) => monthlyMenus.find(m => m.date === dateStr);

    // 入力変更時の処理
    const handleChange = (date: string, field: keyof DailyMenu, value: string) => {
        setEditData(prev => {
            // まだ編集データになければ、既存データ or 空データ を元に作る
            const current = prev[date] || {
                date,
                menu_a: getMenu(date)?.menu_a || '',
                menu_b: getMenu(date)?.menu_b || '',
                menu_bowl: getMenu(date)?.menu_bowl || ''
            };
            return {
                ...prev,
                [date]: { ...current, [field]: value }
            };
        });
    };

    // ★ 一括保存を実行！
    const handleBulkSave = async () => {
        const menusToSave = Object.values(editData);
        if (menusToSave.length === 0) return;

        setIsSaving(true);
        const success = await saveBulkMenus(menusToSave);
        setIsSaving(false);

        if (success) {
            setEditData({}); // 保存できたら編集中の状態をリセット
            onClose(); // 閉じる（好みで閉じなくてもOK）
        }
    };

    // 変更がある件数
    const changedCount = Object.keys(editData).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* ヘッダー */}
                <div className="p-4 border-b flex items-center justify-between bg-white z-10">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        🍽️ 学食メニュー編集
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* 月操作 & ツールバー */}
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                        <button onClick={() => moveMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="font-bold text-lg min-w-[100px] text-center">
                            {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                        </span>
                        <button onClick={() => moveMonth(1)} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* 未保存があるときのアラート（PC用） */}
                    {changedCount > 0 && (
                        <div className="hidden md:flex items-center gap-2 text-sm text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full animate-pulse">
                            <AlertCircle className="w-4 h-4" />
                            {changedCount}件の変更があります
                        </div>
                    )}
                </div>

                {/* メインエリア：メニューリスト */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                        </div>
                    ) : (
                        <div className="space-y-3 pb-20"> {/* 下の固定バーのために余白 */}
                            {/* ヘッダー行 */}
                            <div className="grid grid-cols-12 gap-2 px-2 text-xs font-bold text-gray-400 mb-1">
                                <div className="col-span-2 md:col-span-1 text-center">日付</div>
                                <div className="col-span-10 md:col-span-11 grid grid-cols-3 gap-2">
                                    <div>定食A</div>
                                    <div>定食B</div>
                                    <div>丼・麺</div>
                                </div>
                            </div>

                            {days.map(day => {
                                const isEdited = !!editData[day.date]; // 編集中かどうか
                                const existing = getMenu(day.date);

                                // 表示する値：編集中のデータがあればそれ、なければ既存データ、それもなければ空
                                const valA = editData[day.date]?.menu_a ?? (existing?.menu_a || '');
                                const valB = editData[day.date]?.menu_b ?? (existing?.menu_b || '');
                                const valBowl = editData[day.date]?.menu_bowl ?? (existing?.menu_bowl || '');

                                return (
                                    <div
                                        key={day.date}
                                        className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border transition-all ${isEdited
                                            ? 'bg-orange-50/50 border-orange-200 shadow-sm'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        {/* 日付カラム */}
                                        <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center">
                                            <span className={`text-lg font-bold ${day.isWeekend ? 'text-red-400' : 'text-gray-700'}`}>
                                                {day.date.split('-')[2]}
                                            </span>
                                            <span className={`text-[10px] font-bold ${day.isWeekend ? 'text-red-300' : 'text-gray-400'}`}>
                                                {day.dayLabel}
                                            </span>
                                        </div>

                                        {/* 入力フォームカラム (3分割) */}
                                        <div className="col-span-10 md:col-span-11 grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                value={valA}
                                                onChange={(e) => handleChange(day.date, 'menu_a', e.target.value)}
                                                placeholder="定食A..."
                                                className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={valB}
                                                onChange={(e) => handleChange(day.date, 'menu_b', e.target.value)}
                                                placeholder="定食B..."
                                                className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={valBowl}
                                                onChange={(e) => handleChange(day.date, 'menu_bowl', e.target.value)}
                                                placeholder="丼・麺..."
                                                className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ★ フッター：一括保存バー */}
                <div className="p-4 border-t bg-white flex items-center justify-between gap-4 shadow-lg z-20">
                    <div className="text-sm text-gray-500 font-bold hidden md:block">
                        {changedCount === 0
                            ? "変更箇所はありません 👀"
                            : `現在 ${changedCount} 日分の変更を編集中です ✍️`
                        }
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            閉じる
                        </button>
                        <button
                            onClick={handleBulkSave}
                            disabled={changedCount === 0 || isSaving}
                            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${changedCount > 0
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {changedCount > 0 ? `${changedCount}件を保存する！` : '保存'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}