import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export const DAYS = [
    { id: 1, label: '月' },
    { id: 2, label: '火' },
    { id: 3, label: '水' },
    { id: 4, label: '木' },
    { id: 5, label: '金' },
];
export const PERIODS = [1, 2, 3, 4, 5, 6];

export const EDITOR_COLORS = [
    { id: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
    { id: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
    { id: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    { id: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
    { id: 'teal', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', dot: 'bg-teal-500' },
    { id: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    { id: 'indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    { id: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
    { id: 'pink', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', dot: 'bg-pink-500' },
    { id: 'slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500' },
];

const PERIOD_TIMES: Record<number, { start: string, end: string }> = {
    1: { start: '09:00', end: '10:30' },
    2: { start: '10:40', end: '12:10' },
    3: { start: '12:55', end: '14:25' },
    4: { start: '14:35', end: '16:05' },
    5: { start: '16:15', end: '17:45' },
    6: { start: '17:55', end: '19:25' },
};

// 初期データを生成する関数
const getInitialGrid = () => {
    const grid: Record<string, TimetableItem> = {};
    DAYS.forEach(d => {
        PERIODS.forEach(p => {
            grid[`${d.id}-${p}`] = { subject: '', room: '', color: 'blue' };
        });
    });
    return grid;
};

export type TimetableItem = {
    id?: number;
    subject: string;
    room: string;
    color: string;
    teacher?: string;
};

export type MergedCell = {
    period: number;
    span: number;
    data: TimetableItem;
};

export function useTimetableEditor(userId: string, isOpen: boolean, _onClose: () => void) {
    // 初期値に関数を指定して、最初から空データを持たせる（真っ白画面対策）
    const [gridData, setGridData] = useState<Record<string, TimetableItem>>(getInitialGrid);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCells, setSelectedCells] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchAllSchedules();
            setIsEditMode(false);
            setSelectedCells([]);
        }
    }, [isOpen, userId]);

    const fetchAllSchedules = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('timetables')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            const newGrid = getInitialGrid();

            data?.forEach((s: any) => {
                newGrid[`${s.day_of_week}-${s.period}`] = {
                    id: s.id,
                    subject: s.subject || '',
                    room: s.room || '',
                    color: s.color || 'blue',
                    teacher: s.teacher || ''
                };
            });

            setGridData(newGrid);
        } catch (e) {
            console.error('Fetch error:', e);
            // エラー時でも最低限空のグリッドを表示
        } finally {
            setLoading(false);
        }
    };

    const getMergedSchedule = (dayId: number): MergedCell[] => {
        const result: MergedCell[] = [];
        let skip = 0;

        for (let p = 1; p <= 6; p++) {
            if (skip > 0) {
                skip--;
                continue;
            }

            const currentKey = `${dayId}-${p}`;
            const currentData = gridData[currentKey] || { subject: '', room: '', color: 'blue' };

            if (!currentData.subject) {
                result.push({ period: p, span: 1, data: currentData });
                continue;
            }

            let span = 1;
            for (let nextP = p + 1; nextP <= 5; nextP++) {
                const nextKey = `${dayId}-${nextP}`;
                const nextData = gridData[nextKey];

                if (nextData &&
                    nextData.subject === currentData.subject &&
                    nextData.room === currentData.room &&
                    nextData.color === currentData.color) {
                    span++;
                } else {
                    break;
                }
            }

            result.push({ period: p, span: span, data: currentData });
            skip = span - 1;
        }
        return result;
    };

    const toggleSelection = (day: number, period: number) => {
        if (!isEditMode) return;
        const key = `${day}-${period}`;
        setSelectedCells(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleBulkSave = async (formData: { subject: string, room: string, color: string }) => {
        if (!userId) {
            toast.error('ユーザーIDが見つかりません💦');
            return;
        }
        if (selectedCells.length === 0) {
            toast.error('編集するコマを選択してください👉');
            return;
        }

        setLoading(true);

        const toUpsert = [];
        const toDeleteIds = [];

        for (const key of selectedCells) {
            const [dayStr, periodStr] = key.split('-');
            const day = parseInt(dayStr);
            const period = parseInt(periodStr);
            const existingItem = gridData[key];

            // 科目名が入力されている場合は保存/更新
            if (formData.subject.trim() !== '') {
                toUpsert.push({
                    user_id: userId,
                    day_of_week: day,
                    period: period,
                    subject: formData.subject,
                    room: formData.room,
                    color: formData.color,
                    start_time: PERIOD_TIMES[period].start,
                    end_time: PERIOD_TIMES[period].end,
                    // 既存のIDがあれば更新扱いにする
                    ...(existingItem?.id ? { id: existingItem.id } : {})
                });
            }
            // 科目名が空で、かつ既存データがある（IDがある）場合は削除
            else if (existingItem?.id) {
                toDeleteIds.push(existingItem.id);
            }
        }

        try {
            if (toDeleteIds.length > 0) {
                const { error: delError } = await supabase.from('timetables').delete().in('id', toDeleteIds);
                if (delError) throw delError;
            }
            if (toUpsert.length > 0) {
                const { error: upError } = await supabase.from('timetables').upsert(toUpsert, { onConflict: 'user_id, day_of_week, period' });
                if (upError) throw upError;
            }

            toast.success('時間割を更新しました！✨');
            await fetchAllSchedules();
            setSelectedCells([]);
        } catch (e) {
            console.error('Save error:', e);
            toast.error('保存に失敗しました💦');
        } finally {
            setLoading(false);
        }
    };

    // ★ 追加: 削除機能
    const handleBulkDelete = async () => {
        if (selectedCells.length === 0) return;

        // うっかり消さないように確認を入れると親切かも！
        if (!window.confirm(`${selectedCells.length}件の時間割を削除してもいい？🥺`)) return;

        setLoading(true);
        const toDeleteIds = [];

        // 選択されたセルのIDを集める
        for (const key of selectedCells) {
            const existingItem = gridData[key];
            if (existingItem?.id) {
                toDeleteIds.push(existingItem.id);
            }
        }

        try {
            if (toDeleteIds.length > 0) {
                await supabase.from('timetables').delete().in('id', toDeleteIds);
            }
            // IDがない（まだ保存されてない）セルも含めて、画面を最新にする
            toast.success('削除したよ！🗑️');
            await fetchAllSchedules();
            setSelectedCells([]);
        } catch (e) {
            console.error(e);
            toast.error('削除に失敗しちゃった💦');
        } finally {
            setLoading(false);
        }
    };

    return {
        gridData,
        loading,
        isEditMode, setIsEditMode,
        selectedCells, setSelectedCells,
        getMergedSchedule,
        toggleSelection,
        handleBulkSave,
        handleBulkDelete,
        refresh: fetchAllSchedules
    };
}