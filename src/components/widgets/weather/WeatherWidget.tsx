import { useWeatherWidget } from './useWeatherWidget';
import { MapPin } from 'lucide-react';

export function WeatherWidget() {
    const { weather, loading, getWeatherInfo } = useWeatherWidget();

    if (loading || !weather) {
        return (
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center justify-center h-full min-h-[84px] animate-pulse">
                <div className="w-6 h-6 bg-gray-100 rounded-full" />
            </div>
        );
    }

    const { icon: WeatherIcon, color } = getWeatherInfo(weather.weather_code);

    return (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between min-h-[84px]">

            {/* 背景装飾 */}
            <div className={`absolute -right-3 -top-3 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity rotate-12 pointer-events-none ${color}`}>
                <WeatherIcon className="w-16 h-16" />
            </div>

            {/* ヘッダー：場所 */}
            <div className="flex items-center justify-between relative z-10 mb-1">
                <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    EBETSU
                </div>
                {/* 晴れ/雨などのラベルを小さく表示 */}
                {/* <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-50 ${color} bg-opacity-10`}>
                    Today
                </span> */}
            </div>

            {/* メイン：気温とアイコン */}
            <div className="flex items-center justify-center gap-3 relative z-10 flex-1">
                <WeatherIcon className={`w-8 h-8 ${color} drop-shadow-sm`} />

                <div className="text-4xl font-black text-gray-800 tracking-tighter font-mono leading-none flex items-start">
                    {Math.round(weather.temperature_2m)}
                    <span className="text-sm font-bold text-gray-400 mt-1 ml-0.5">°C</span>
                </div>
            </div>
            {/* 下線アクセント */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 opacity-50" />
        </div>
    );
}