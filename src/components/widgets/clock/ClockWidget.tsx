import { useClockWidget } from './useClockWidget';
import { Clock } from 'lucide-react';

export function ClockWidget() {
    const { timeString, dateString, seconds } = useClockWidget();

    return (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between min-h-[84px]">

            {/* 背景装飾（超控えめに） */}
            <div className="absolute -right-3 -top-3 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity rotate-12 pointer-events-none">
                <Clock className="w-16 h-16" />
            </div>

            {/* ヘッダー：アイコンと日付 */}
            <div className="flex items-center justify-between relative z-10 mb-1">
                <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    CLOCK
                </h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    {dateString}
                </span>
            </div>

            {/* メイン：時刻表示 */}
            <div className="flex items-center justify-center relative z-10 flex-1">
                <div className="text-4xl font-black text-gray-800 tracking-tighter font-mono leading-none flex items-baseline">
                    {timeString}
                    {/* 秒ドット */}
                    <span className={`ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500 mb-1 transition-opacity duration-500 ${seconds % 2 === 0 ? 'opacity-100' : 'opacity-20'}`} />
                </div>
            </div>

            {/* 下線アクセント */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 opacity-50" />
        </div>
    );
}