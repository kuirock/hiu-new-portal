import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { Destination, BusStop, DayType } from './useBusSchedule';

// 6時から23時まで対応
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);

export function useBusScheduleEditor(isOpen: boolean) {
    const [destination, setDestination] = useState<Destination>('shinsapporo');
    const [dayType, setDayType] = useState<DayType>('weekday');

    // エディタ用のデータ (入力されたテキストを保持)
    // { edc: { "8": "10 20s", "9": "00" }, shirakaba: { ... } }
    const [gridData, setGridData] = useState<Record<BusStop, Record<number, string>>>({
        edc: {},
        shirakaba: {}
    });

    useEffect(() => {
        if (isOpen) fetchGridData();
    }, [isOpen, destination, dayType]);

    const fetchGridData = async () => {
        // eDCと白樺通の両方のデータを一気に取得
        const { data } = await supabase
            .from('bus_schedules')
            .select('*')
            .eq('destination', destination)
            .eq('day_type', dayType);

        const newGrid: any = { edc: {}, shirakaba: {} };

        // データをテキスト形式 ("10 20s") に変換してセット
        data?.forEach((record: any) => {
            const stop = record.bus_stop as BusStop;
            if (!record.timetables) return;

            // 時間ごとにグループ化
            const grouped: Record<number, string[]> = {};
            record.timetables.forEach((t: any) => {
                if (!grouped[t.hour]) grouped[t.hour] = [];
                // スクールバスなら 's' をつける
                grouped[t.hour].push(`${t.minute.toString().padStart(2, '0')}${t.is_school ? 's' : ''}`);
            });

            // 文字列に結合してセット
            Object.keys(grouped).forEach((h: any) => {
                newGrid[stop][h] = grouped[h].sort().join(' ');
            });
        });

        setGridData(newGrid);
    };

    // 入力変更ハンドラ
    const handleInputChange = (stop: BusStop, hour: number, value: string) => {
        setGridData(prev => ({
            ...prev,
            [stop]: {
                ...prev[stop],
                [hour]: value
            }
        }));
    };

    // 保存処理
    const handleSave = async () => {
        try {
            const stops: BusStop[] = ['edc', 'shirakaba'];

            for (const stop of stops) {
                const timetables = [];
                const stopData = gridData[stop];

                // テキストをパースしてJSONデータに変換
                for (const hourStr in stopData) {
                    const hour = parseInt(hourStr);
                    const text = stopData[hour];
                    if (!text) continue;

                    // スペースやカンマで区切って解析
                    const parts = text.split(/[\s,]+/);
                    for (const part of parts) {
                        const trimmed = part.trim();
                        if (!trimmed) continue;

                        // 数字部分と 's' を判定
                        const minute = parseInt(trimmed.replace(/\D/g, ''));
                        const isSchool = trimmed.toLowerCase().includes('s');

                        if (!isNaN(minute) && minute >= 0 && minute < 60) {
                            timetables.push({ hour, minute, is_school: isSchool });
                        }
                    }
                }

                // DBに保存 (Upsert)
                const payload = {
                    destination,
                    bus_stop: stop,
                    day_type: dayType,
                    timetables // JSONBデータ
                };

                const { error } = await supabase
                    .from('bus_schedules')
                    .upsert(payload, { onConflict: 'destination, bus_stop, day_type' });

                if (error) throw error;
            }

            toast.success('時刻表を保存しました！📅✨');
        } catch (e) {
            console.error(e);
            toast.error('保存に失敗しました💦');
        }
    };

    return {
        HOURS,
        destination, setDestination,
        dayType, setDayType,
        gridData,
        handleInputChange,
        handleSave
    };
}