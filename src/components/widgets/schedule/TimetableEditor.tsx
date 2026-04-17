import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { X, Calendar, Edit3, Check, MousePointerClick, Trash2, Save } from 'lucide-react';
import { useTimetableEditor, DAYS, PERIODS, EDITOR_COLORS } from './useTimetableEditor';

interface TimetableEditorProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function TimetableEditor({ userId, isOpen, onClose }: TimetableEditorProps) {
    const {
        isEditMode, setIsEditMode,
        selectedCells, setSelectedCells,
        getMergedSchedule,
        toggleSelection,
        handleBulkSave,
        handleBulkDelete,
        gridData,
        loading
    } = useTimetableEditor(userId, isOpen, onClose);

    const [editForm, setEditForm] = useState({ subject: '', room: '', color: 'blue' });

    useEffect(() => {
        if (selectedCells.length === 0) {
            setEditForm({ subject: '', room: '', color: 'blue' });
            return;
        }

        if (selectedCells.length === 1) {
            const key = selectedCells[0];
            const data = gridData[key];

            if (data && data.subject) {
                setEditForm({
                    subject: data.subject,
                    room: data.room,
                    color: data.color || 'blue'
                });
            } else {
                setEditForm({ subject: '', room: '', color: 'blue' });
            }
        }
    }, [selectedCells, gridData]);

    if (!isOpen) return null;

    const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in p-0 md:p-6"
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
            onTouchStart={stopPropagation}
            onTouchEnd={stopPropagation}
        >
            <div className="bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* ヘッダー */}
                <div className="px-3 py-2 md:px-6 md:py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 shadow-sm z-20">
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className={`p-1.5 md:p-2.5 rounded-xl transition-colors ${isEditMode ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-50 text-orange-500'}`}>
                            {isEditMode ? <Edit3 className="w-4 h-4 md:w-5 md:h-5" /> : <Calendar className="w-4 h-4 md:w-5 md:h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm md:text-xl text-gray-800 leading-tight">
                                {isEditMode ? 'スケジュール編集' : '時間割'}
                            </h3>
                            <p className="text-[10px] md:text-xs text-gray-400 font-medium hidden md:block">
                                {isEditMode ? '編集したいコマを選択して右側のフォームで入力してください' : '登録済みのスケジュールを確認できます'}
                            </p>
                        </div>

                        {/* 編集モード切り替えボタン */}
                        {!isEditMode && (
                            <>
                                <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-[10px] md:text-sm flex items-center gap-1 md:gap-2 transition-all bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:shadow-lg"
                                >
                                    <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden md:inline">編集する</span>
                                    <span className="md:hidden">編集</span>
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            if (isEditMode) {
                                setIsEditMode(false); // 🌟 編集モードなら、閲覧モードに戻るだけ！
                                setSelectedCells([]); // ついでに選択中のセルも解除しておく
                            } else {
                                onClose(); // 🌟 閲覧モードなら、今まで通り全部閉じる！
                            }
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* メインエリア */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50">

                    {/* 左側：スケジュールグリッド */}
                    <div className={`flex-1 overflow-y-auto overflow-x-hidden relative transition-all duration-300 ${isEditMode ? 'md:w-3/5' : 'w-full'}`}>
                        <div className="w-full min-h-full flex flex-row p-1 md:p-6 pb-24 md:pb-6">

                            {/* 時限ラベル */}
                            <div className="w-6 md:w-12 flex flex-col shrink-0 pt-6 md:pt-10 gap-0.5 md:gap-1 mr-1 md:mr-2">
                                {PERIODS.map(p => (
                                    <div key={p} className="flex-1 flex items-center justify-center min-h-[60px] md:min-h-[auto]">
                                        <span className="text-[10px] md:text-sm font-bold text-gray-400 bg-gray-100 w-5 h-5 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                                            {p}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* 曜日カラム */}
                            <div className="flex-1 flex gap-0.5 md:gap-2 min-w-0">
                                {DAYS.map(day => (
                                    <div key={day.id} className="flex-1 flex flex-col min-w-0">
                                        <div className="h-6 md:h-10 shrink-0 flex items-center justify-center font-bold text-[10px] md:text-base text-gray-600 mb-0.5 md:mb-2 bg-gray-100/50 rounded-t-lg md:bg-transparent">
                                            {day.label}
                                        </div>

                                        <div className="flex-1 flex flex-col gap-0.5 md:gap-2">
                                            {isEditMode ? (
                                                PERIODS.map(period => {
                                                    const key = `${day.id}-${period}`;
                                                    const isSelected = selectedCells.includes(key);
                                                    const data = gridData[key] || { subject: '', room: '', color: 'blue' };
                                                    const hasData = !!data.subject;
                                                    const colorDef = EDITOR_COLORS.find(c => c.id === data.color) || EDITOR_COLORS[5];

                                                    return (
                                                        <div
                                                            key={period}
                                                            onClick={() => toggleSelection(day.id, period)}
                                                            className={`flex-1 min-h-[60px] rounded-sm md:rounded-xl border md:border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-0 md:p-1 text-center relative overflow-hidden
                                                                ${isSelected
                                                                    ? 'border-indigo-500 bg-indigo-50/50 ring-1 md:ring-2 ring-indigo-200 z-10'
                                                                    : hasData
                                                                        ? `${colorDef.bg} ${colorDef.border}`
                                                                        : 'border-dashed border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-indigo-500/20 z-20 flex items-center justify-center">
                                                                    <Check className="w-4 h-4 text-indigo-600 drop-shadow-sm" />
                                                                </div>
                                                            )}
                                                            {hasData ? (
                                                                <div className="w-full h-full flex flex-col items-center justify-center px-0.5">
                                                                    <span className={`text-[8px] md:text-xs font-bold leading-tight line-clamp-2 md:line-clamp-2 w-full break-words ${colorDef.text}`}>
                                                                        {data.subject}
                                                                    </span>
                                                                    {data.room && (
                                                                        <span className="text-[7px] md:text-[10px] text-gray-400/80 leading-none mt-0.5 truncate max-w-full">
                                                                            {data.room}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <MousePointerClick className="w-3 h-3 text-gray-100 md:text-gray-200" />
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                getMergedSchedule(day.id).map(cell => {
                                                    const colorDef = EDITOR_COLORS.find(c => c.id === cell.data.color) || EDITOR_COLORS[5];
                                                    const hasData = !!cell.data.subject;
                                                    const minHeight = cell.span * 60;

                                                    return (
                                                        <div
                                                            key={cell.period}
                                                            style={{
                                                                flexGrow: cell.span,
                                                                flexBasis: 0,
                                                                minHeight: `${minHeight}px`
                                                            }}
                                                            className={`rounded-sm md:rounded-xl border p-0.5 md:p-2 flex flex-col items-center justify-center text-center transition-all shadow-sm overflow-hidden
                                                                ${hasData
                                                                    ? `${colorDef.bg} ${colorDef.border}`
                                                                    : 'bg-white border-transparent'
                                                                }`}
                                                        >
                                                            {hasData && (
                                                                <div className="w-full max-h-full flex flex-col items-center justify-center">
                                                                    <span className={`font-bold text-[9px] md:text-sm leading-tight line-clamp-3 w-full break-words ${colorDef.text}`}>
                                                                        {cell.data.subject}
                                                                    </span>
                                                                    {cell.data.room && (
                                                                        <span className="text-[7px] md:text-xs font-bold text-gray-500/80 mt-0.5 md:mt-1 bg-white/60 px-1 py-0 md:px-1.5 md:py-0.5 rounded md:rounded-full backdrop-blur-sm truncate max-w-full">
                                                                            {cell.data.room}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 右側：編集フォーム */}
                    {isEditMode && (
                        <div className="w-full md:w-[400px] h-[45vh] md:h-auto shrink-0 bg-white border-t md:border-t-0 md:border-l border-gray-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] md:shadow-xl flex flex-col z-30 animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 duration-300">
                            <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3 md:mb-6">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                                    </div>
                                    <h4 className="font-bold text-sm md:text-lg text-gray-700">登録フォーム</h4>
                                </div>

                                {selectedCells.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-6 md:py-10 px-4 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 h-full md:h-auto">
                                        <MousePointerClick className="w-8 h-8 md:w-12 md:h-12 text-gray-300 mb-2 md:mb-3" />
                                        <p className="font-bold text-xs md:text-base text-gray-500">コマが未選択です</p>
                                        <p className="text-[10px] md:text-xs text-gray-400 mt-1">
                                            上のスケジュールから<br />編集したいコマをタップしてください
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 md:space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="p-2 md:p-4 bg-indigo-50 border border-indigo-100 rounded-lg md:rounded-xl flex items-center gap-3">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow">
                                                {selectedCells.length}
                                            </div>
                                            <div className="text-[10px] md:text-xs text-indigo-800 font-bold">
                                                選択中のコマをまとめて編集します
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:space-y-4">
                                            <div className="space-y-1 md:space-y-2">
                                                <label className="text-[10px] md:text-xs font-bold text-gray-500 ml-1">科目名</label>
                                                {/* ★ここが修正ポイント：text-base にしてスマホでの自動ズームを防ぐ。autoFocusも削除 */}
                                                <input
                                                    type="text"
                                                    value={editForm.subject}
                                                    onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 rounded-lg md:rounded-2xl px-3 py-2 md:px-4 md:py-3 font-bold text-base focus:outline-none transition-all placeholder:text-gray-300"
                                                    placeholder="例: プログラミング演習"
                                                />
                                            </div>

                                            <div className="space-y-1 md:space-y-2">
                                                <label className="text-[10px] md:text-xs font-bold text-gray-500 ml-1">教室</label>
                                                {/* ★ここも text-base に変更 */}
                                                <input
                                                    type="text"
                                                    value={editForm.room}
                                                    onChange={e => setEditForm({ ...editForm, room: e.target.value })}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 rounded-lg md:rounded-2xl px-3 py-2 md:px-4 md:py-3 font-bold text-base focus:outline-none transition-all placeholder:text-gray-300"
                                                    placeholder="例: 1201"
                                                />
                                            </div>

                                            <div className="space-y-1 md:space-y-2">
                                                <label className="text-[10px] md:text-xs font-bold text-gray-500 ml-1">カラー</label>
                                                <div className="grid grid-cols-5 gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100">
                                                    {EDITOR_COLORS.map(c => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => setEditForm({ ...editForm, color: c.id })}
                                                            className={`aspect-square rounded-lg md:rounded-xl border-2 transition-all flex items-center justify-center relative ${c.bg} ${c.border} ${editForm.color === c.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-105 shadow-sm' : 'hover:scale-105'}`}
                                                        >
                                                            <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${c.dot}`} />
                                                            {editForm.color === c.id && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Check className={`w-4 h-4 md:w-5 md:h-5 ${c.text}`} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 md:p-6 bg-white border-t border-gray-100 flex flex-col gap-2 md:gap-3 shrink-0 pb-safe">
                                <button
                                    onClick={() => handleBulkSave(editForm)}
                                    disabled={selectedCells.length === 0 || loading}
                                    className={`w-full py-2.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-base shadow-lg transition-all flex items-center justify-center gap-2
                                        ${selectedCells.length === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 md:w-5 md:h-5" />
                                            保存する
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleBulkDelete}
                                    disabled={selectedCells.length === 0 || loading}
                                    className={`w-full py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-sm transition-all flex items-center justify-center gap-2
                                        ${selectedCells.length === 0
                                            ? 'bg-transparent text-gray-300 cursor-not-allowed'
                                            : 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 active:scale-[0.98]'
                                        }`}
                                >
                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    削除する
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}