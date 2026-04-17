import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export type Destination = 'shinsapporo' | 'kitahiroshima';
export type BusStop = 'edc' | 'shirakaba';
export type DayType = 'weekday' | 'holiday';

export function useBusSchedule() {
    // ユーザーの選択
    const [destination, setDestination] = useState<Destination>('shinsapporo');
    const [busStop, setBusStop] = useState<BusStop>('edc');

    // 今日のデータ
    const [timetables, setTimetables] = useState<any[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    // 平日・休日判定
    const getTodayType = (): DayType => {
        const day = new Date().getDay();
        return (day === 0 || day === 6) ? 'holiday' : 'weekday'; // 土日は休日
    };
    const [dayType, _setDayType] = useState<DayType>(getTodayType());

    // 次のバス用
    const [nextBus, setNextBus] = useState<any>(null);
    const [upcomingBuses, setUpcomingBuses] = useState<any[]>([]);
    const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

    useEffect(() => {
        // 行き先、バス停、曜日が変わったら再取得
        fetchSchedules();
    }, [destination, busStop, dayType]);

    // 1分ごとにカウントダウン更新
    useEffect(() => {
        const timer = setInterval(calculateNextBus, 1000 * 30);
        return () => clearInterval(timer);
    }, [timetables]); // データが変わったら再計算

    const fetchSchedules = async () => {
        const { data } = await supabase
            .from('bus_schedules')
            .select('*')
            .eq('destination', destination)
            .eq('bus_stop', busStop)
            .eq('day_type', dayType)
            .single();

        if (data && data.timetables) {
            // 時間順にソート
            const sorted = data.timetables.sort((a: any, b: any) => {
                if (a.hour !== b.hour) return a.hour - b.hour;
                return a.minute - b.minute;
            });
            setTimetables(sorted);
        } else {
            setTimetables([]);
        }
    };

    // データが更新されたら計算を実行
    useEffect(() => {
        calculateNextBus();
    }, [timetables]);

    const calculateNextBus = () => {
        if (!timetables.length) {
            setNextBus(null);
            setUpcomingBuses([]);
            setMinutesLeft(null);
            return;
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // 現在時刻以降のバスを抽出
        const futureBuses = timetables.filter(t =>
            t.hour > currentHour || (t.hour === currentHour && t.minute >= currentMinute)
        );

        if (futureBuses.length > 0) {
            setNextBus(futureBuses[0]);
            setUpcomingBuses(futureBuses.slice(0, 4)); // 次の4本まで表示

            // あと何分か計算
            const busTime = new Date();
            busTime.setHours(futureBuses[0].hour, futureBuses[0].minute, 0, 0);
            const diffMs = busTime.getTime() - now.getTime();
            const diffMins = Math.ceil(diffMs / (1000 * 60));

            setMinutesLeft(diffMins >= 0 ? diffMins : 0);
        } else {
            setNextBus(null);
            setUpcomingBuses([]);
            setMinutesLeft(null);
        }
    };

    return {
        destination, setDestination,
        busStop, setBusStop,
        dayType,
        isEditorOpen, setIsEditorOpen,
        fetchSchedules,
        upcomingBuses,
        nextBus,
        minutesLeft,
    };
}