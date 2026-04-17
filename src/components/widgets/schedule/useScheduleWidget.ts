import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

// 🎨 15色対応パレット
export const COLORS: Record<string, string> = {
    red: 'bg-red-50 border-red-100 text-red-600',
    orange: 'bg-orange-50 border-orange-100 text-orange-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
    lime: 'bg-lime-50 border-lime-100 text-lime-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    teal: 'bg-teal-50 border-teal-100 text-teal-600',
    cyan: 'bg-cyan-50 border-cyan-100 text-cyan-600',
    sky: 'bg-sky-50 border-sky-100 text-sky-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    pink: 'bg-pink-50 border-pink-100 text-pink-600',
    rose: 'bg-rose-50 border-rose-100 text-rose-600',
    slate: 'bg-slate-50 border-slate-100 text-slate-600',
};

export const BAR_COLORS: Record<string, string> = {
    red: 'bg-red-500', orange: 'bg-orange-500', amber: 'bg-amber-500',
    yellow: 'bg-yellow-400', lime: 'bg-lime-500', green: 'bg-green-500',
    teal: 'bg-teal-500', cyan: 'bg-cyan-500', sky: 'bg-sky-500',
    blue: 'bg-blue-500', indigo: 'bg-indigo-500', purple: 'bg-purple-500',
    pink: 'bg-pink-500', rose: 'bg-rose-500', slate: 'bg-slate-500',
};

export function useScheduleWidget(currentUserId: string) {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [todayDate, setTodayDate] = useState(new Date());

    useEffect(() => {
        fetchTodaySchedule();
    }, [currentUserId]);

    const fetchTodaySchedule = async () => {
        const today = new Date();
        setTodayDate(today);
        const dayOfWeek = today.getDay(); // 0:日, 1:月...

        const { data } = await supabase
            .from('timetables')
            .select('*')
            .eq('user_id', currentUserId)
            .eq('day_of_week', dayOfWeek)
            .neq('subject', '') // ★ 空の科目は除外
            .order('period', { ascending: true });

        setSchedule(data || []);
    };

    return {
        schedule,
        isEditorOpen,
        setIsEditorOpen,
        todayDate,
        fetchTodaySchedule
    };
}