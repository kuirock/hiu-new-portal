import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export type MenuType = 'A' | 'B' | 'Bowl';

export interface DailyMenu {
    date: string;
    menu_a: string;
    menu_b: string;
    menu_bowl: string;
}

// 日本時間で YYYY-MM-DD を作る魔法の関数 🪄
export const getLocalDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function useCafeteriaMenu(_currentUserId?: string) {
    const [todayMenu, setTodayMenu] = useState<DailyMenu | null>(null);
    const [monthlyMenus, setMonthlyMenus] = useState<DailyMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchTodayMenu();
    }, []);

    useEffect(() => {
        fetchMonthlyMenus();
    }, [currentMonth]);

    // 今日のメニューを取得
    const fetchTodayMenu = async () => {
        const today = getLocalDateStr(new Date());

        // ★ 追加: 今日より前のメニューを自動削除（お掃除）🧹
        // これで Supabase に古いデータが残らなくなるよ！
        try {
            await supabase
                .from('cafeteria_menus')
                .delete()
                .lt('date', today); // date が today より小さい（過去）ものを削除
        } catch (err) {
            console.error('Old menu cleanup error:', err);
        }

        try {
            // .single() → .maybeSingle() に変更！
            const { data, error } = await supabase
                .from('cafeteria_menus')
                .select('*')
                .eq('date', today)
                .maybeSingle();

            if (error) {
                console.error('Today menu fetch error:', error);
            }

            setTodayMenu(data || null);
        } catch (e) {
            console.error(e);
            setTodayMenu(null);
        } finally {
            setLoading(false);
        }
    };

    // 月ごとのメニューを取得（カレンダー用）
    const fetchMonthlyMenus = async () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;

        // 月の初日と末日を計算
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const startDateStr = getLocalDateStr(startDate);
        const endDateStr = getLocalDateStr(endDate);

        const { data, error } = await supabase
            .from('cafeteria_menus')
            .select('*')
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .order('date', { ascending: true });

        if (error) {
            console.error('Monthly menu fetch error:', error);
        } else {
            setMonthlyMenus(data || []);
        }
    };

    // メニュー保存（単体）
    const saveMenu = async (menu: DailyMenu) => {
        const { error } = await supabase
            .from('cafeteria_menus')
            .upsert(menu, { onConflict: 'date' });

        if (error) {
            toast.error('保存に失敗しました😭');
            console.error(error);
        } else {
            toast.success('メニューを保存しました！🍽️');

            // もし今日の分を更新したなら、表示も更新
            if (menu.date === getLocalDateStr(new Date())) {
                setTodayMenu(menu);
            }
            fetchMonthlyMenus(); // カレンダーも更新
        }
    };

    // ★ 新機能: まとめて一括保存！🚀
    const saveBulkMenus = async (menus: DailyMenu[]) => {
        if (menus.length === 0) return false;

        const { error } = await supabase
            .from('cafeteria_menus')
            .upsert(menus, { onConflict: 'date' });

        if (error) {
            toast.error('保存に失敗しました...💦');
            console.error(error);
            return false; // 失敗
        } else {
            // 今日の分が含まれてたら更新しておく
            const todayStr = getLocalDateStr(new Date());
            const todayUpdate = menus.find(m => m.date === todayStr);
            if (todayUpdate) {
                setTodayMenu(todayUpdate);
            }

            await fetchMonthlyMenus(); // リストを再取得
            toast.success(`${menus.length}日分のメニューを保存したよ！🍽️✨`);
            return true; // 成功
        }
    };

    // 月変更
    const moveMonth = (offset: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentMonth(newDate);
    };

    return {
        todayMenu,
        monthlyMenus,
        currentMonth, // カレンダー表示用に現在の月も返す
        loading,
        fetchTodayMenu,
        fetchMonthlyMenus,
        saveMenu,
        saveBulkMenus,
        moveMonth
    };
}