import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export type FacilityType = 'library' | 'seicomart';

export function useOpeningHours(type: FacilityType, profile: any) {
    const isAdmin = profile?.role === 'admin';

    // 今日の表示用データ
    const [todaySchedule, setTodaySchedule] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // カレンダー管理用データ
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthSchedules, setMonthSchedules] = useState<Record<string, any>>({});

    // 初期化
    useEffect(() => {
        fetchTodaySchedule();
    }, [type]);

    // 管理者用の処理
    useEffect(() => {
        if (isAdmin) {
            fetchMonthSchedules(currentMonth);
            cleanupOldSchedules();
        }
    }, [type, currentMonth, isAdmin]);

    // 過去データ削除
    const cleanupOldSchedules = async () => {
        const today = new Date().toLocaleDateString('en-CA');
        const { error } = await supabase
            .from('facility_schedules')
            .delete()
            .eq('type', type)
            .lt('date', today);

        if (error) console.error('お掃除失敗...', error);
    };

    const fetchTodaySchedule = async () => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        // ★ ここを .maybeSingle() に変更！
        // これでデータが無くてもエラー（406）にならずに null が返るようになるよ
        const { data } = await supabase
            .from('facility_schedules')
            .select('*')
            .eq('type', type)
            .eq('date', todayStr)
            .maybeSingle();

        setTodaySchedule(data || null);
        setLoading(false);
    };

    const fetchMonthSchedules = async (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // 月の最終日を計算（前回修正した部分）
        const lastDay = new Date(year, month, 0).getDate();

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        const { data, error } = await supabase
            .from('facility_schedules')
            .select('*')
            .eq('type', type)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) {
            console.error('月のデータ取得失敗...', error);
            return;
        }

        const scheduleMap: Record<string, any> = {};
        data?.forEach((item: any) => {
            scheduleMap[item.date] = item;
        });
        setMonthSchedules(scheduleMap);
    };

    // 複数データの保存
    const saveSchedules = async (dates: Date[], settings: { open: string, close: string, is_closed: boolean }) => {
        if (dates.length === 0) return toast.error('日付を選んでね！👉📅');

        const updates = dates.map(date => ({
            type,
            date: date.toLocaleDateString('en-CA'),
            open_time: settings.open,
            close_time: settings.close,
            is_closed: settings.is_closed
        }));

        const { error } = await supabase
            .from('facility_schedules')
            .upsert(updates, { onConflict: 'type, date' });

        if (error) {
            console.error(error);
            toast.error('保存失敗しちゃった💦');
        } else {
            toast.success(`${dates.length}日分の予定を更新したよ！✨`);
            fetchMonthSchedules(currentMonth);
            fetchTodaySchedule();
        }
    };

    return {
        isAdmin,
        loading,
        todaySchedule,
        currentMonth, setCurrentMonth,
        monthSchedules,
        saveSchedules
    };
}