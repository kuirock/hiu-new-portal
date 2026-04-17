import { X, Save, Bus, MapPin, Calendar, CalendarDays } from 'lucide-react';
import { useBusScheduleEditor } from './useBusScheduleEditor';

interface BusScheduleEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BusScheduleEditor({ isOpen, onClose }: BusScheduleEditorProps) {
    const {
        HOURS,
        destination, setDestination,
        dayType, setDayType,
        gridData,
        handleInputChange,
        handleSave
    } = useBusScheduleEditor(isOpen);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                {/* ヘッダー */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white shrink-0">
                    <h3 className="font-bold flex items-center gap-2 text-lg">
                        <Bus className="w-5 h-5" /> 時刻表エディタ（マトリクス入力）
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                {/* 設定エリア */}
                <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-2 gap-4 shrink-0">
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                        <button onClick={() => setDestination('shinsapporo')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${destination === 'shinsapporo' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}>新札幌行き</button>
                        <button onClick={() => setDestination('kitahiroshima')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${destination === 'kitahiroshima' ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}`}>北広島行き</button>
                    </div>
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                        <button onClick={() => setDayType('weekday')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${dayType === 'weekday' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}><Calendar className="w-3 h-3" /> 平日</button>
                        <button onClick={() => setDayType('holiday')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${dayType === 'holiday' ? 'bg-red-500 text-white' : 'text-gray-400'}`}><CalendarDays className="w-3 h-3" /> 土日祝</button>
                    </div>
                </div>

                {/* 入力説明 */}
                <div className="px-4 py-2 bg-yellow-50 text-yellow-800 text-xs font-bold flex items-center justify-center gap-4 shrink-0">
                    <span>💡 入力方法: 分をスペース区切りで入力 (例: "10 25 40")</span>
                    <span className="flex items-center gap-1"><span className="bg-yellow-400 text-yellow-900 px-1 rounded">25s</span> = スクールバス</span>
                </div>

                {/* マトリクス入力エリア */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
                        {/* ヘッダー行 */}
                        <div className="font-bold text-center text-gray-400 text-xs py-2 sticky top-0 bg-white z-10">時</div>
                        <div className="font-bold text-center text-indigo-600 text-xs py-2 sticky top-0 bg-indigo-50 rounded-t-lg z-10 flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" /> eDCタワー (構内)
                        </div>
                        <div className="font-bold text-center text-green-600 text-xs py-2 sticky top-0 bg-green-50 rounded-t-lg z-10 flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" /> 情報大学前(白樺通沿)
                        </div>

                        {HOURS.map(hour => (
                            <div key={hour} className="contents group">
                                {/* 時 */}
                                <div className="flex items-center justify-center font-mono font-bold text-lg text-gray-400 bg-gray-50 rounded-lg">
                                    {hour}
                                </div>

                                {/* eDC入力 */}
                                <input
                                    type="text"
                                    value={gridData.edc[hour] || ''}
                                    onChange={(e) => handleInputChange('edc', hour, e.target.value)}
                                    placeholder="..."
                                    className="w-full bg-indigo-50/30 border border-indigo-100 rounded-lg px-3 py-2 font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white text-indigo-900 placeholder-indigo-200"
                                />

                                {/* 白樺入力 */}
                                <input
                                    type="text"
                                    value={gridData.shirakaba[hour] || ''}
                                    onChange={(e) => handleInputChange('shirakaba', hour, e.target.value)}
                                    placeholder="..."
                                    className="w-full bg-green-50/30 border border-green-100 rounded-lg px-3 py-2 font-mono text-lg focus:ring-2 focus:ring-green-500 outline-none transition-all focus:bg-white text-green-900 placeholder-green-200"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 保存ボタン */}
                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                    <button
                        onClick={async () => { await handleSave(); onClose(); }}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        この内容で保存する
                    </button>
                </div>
            </div>
        </div>
    );
}