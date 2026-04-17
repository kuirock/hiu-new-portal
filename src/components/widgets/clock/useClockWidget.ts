import { useState, useEffect } from 'react';

export function useClockWidget() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // フォーマット関連
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            weekday: 'short',
        });
    };

    // おまけ：秒のバーとか作るために秒数を取得
    const seconds = time.getSeconds();

    return {
        time,
        seconds,
        timeString: formatTime(time),
        dateString: formatDate(time),
    };
}