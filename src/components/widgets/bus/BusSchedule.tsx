import { Bus, Settings, MapPin, School } from 'lucide-react';
import { BusScheduleEditor } from './BusScheduleEditor';
import { useBusSchedule } from './useBusSchedule';

interface BusScheduleProps {
    profile: any;
}

export function BusSchedule({ profile }: BusScheduleProps) {
    const {
        destination, setDestination,
        busStop, setBusStop,
        dayType,
        isEditorOpen, setIsEditorOpen,
        fetchSchedules,
        upcomingBuses,
        nextBus,
        minutesLeft
    } = useBusSchedule();

    const isAdmin = profile?.role === 'admin';

    const formatTime = (h: number, m: number) => {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative group overflow-hidden">
            {/* ヘッダー: 設定とダイヤ情報 */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${dayType === 'holiday' ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200 bg-gray-50'}`}>
                        {dayType === 'holiday' ? '土日祝ダイヤ' : '平日ダイヤ'}
                    </span>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsEditorOpen(true)} className="p-1.5 rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* 行き先・バス停切り替えタブ */}
            <div className="space-y-2 mb-4 relative z-10">
                {/* 行き先 */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setDestination('shinsapporo')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${destination === 'shinsapporo' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                    >
                        新札幌行き
                    </button>
                    <button
                        onClick={() => setDestination('kitahiroshima')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${destination === 'kitahiroshima' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                    >
                        北広島行き
                    </button>
                </div>

                {/* バス停 */}
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => setBusStop('edc')}
                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${busStop === 'edc' ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-transparent text-gray-400 hover:bg-gray-50'}`}
                    >
                        <MapPin className="w-3 h-3" /> eDCタワー(構内)
                    </button>
                    <button
                        onClick={() => setBusStop('shirakaba')}
                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${busStop === 'shirakaba' ? 'border-green-200 bg-green-50 text-green-600' : 'border-transparent text-gray-400 hover:bg-gray-50'}`}
                    >
                        <MapPin className="w-3 h-3" /> 情報大学前　(白樺通沿)
                    </button>
                </div>
            </div>

            {/* メイン表示エリア */}
            <div className="flex flex-col items-center justify-center py-2 relative z-10 min-h-[140px]">
                {nextBus ? (
                    <>
                        {/* スクールバス表示 */}
                        {nextBus.is_school && (
                            <div className="absolute top-0 right-0 animate-bounce">
                                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                    <School className="w-3 h-3" /> SCHOOL
                                </span>
                            </div>
                        )}

                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Next Bus</div>

                        <div className="text-6xl font-black text-gray-800 tracking-tighter mb-3 font-mono leading-none">
                            {formatTime(nextBus.hour, nextBus.minute)}
                        </div>

                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${minutesLeft !== null && minutesLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                            <Bus className="w-4 h-4" />
                            <span className="text-lg font-bold">
                                {minutesLeft === 0 ? 'まもなく発車' : `あと ${minutesLeft} 分`}
                            </span>
                        </div>

                        {/* 次のバスリスト */}
                        <div className="mt-4 flex gap-3 opacity-60">
                            {upcomingBuses.slice(1).map((bus, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="text-xs font-mono font-bold text-gray-600">{formatTime(bus.hour, bus.minute)}</span>
                                    {bus.is_school && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-0.5" />}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-6 text-center text-gray-400">
                        <Bus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <span className="text-sm font-bold">本日の運行終了</span>
                    </div>
                )}
            </div>

            <BusScheduleEditor isOpen={isEditorOpen} onClose={() => { setIsEditorOpen(false); fetchSchedules(); }} />
            {/* 下線アクセント */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 opacity-50" />
        </div>
    );
}