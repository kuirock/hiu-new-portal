import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudLightning, CloudDrizzle } from 'lucide-react';

// 北海道情報大学（江別市西野幌）の座標
const LAT = 43.0642;
const LON = 141.5478;

export function useWeatherWidget() {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        try {
            // 風速(wind_speed)を削除して軽量化！
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=Asia%2FTokyo`
            );
            const data = await res.json();
            setWeather(data.current);
        } catch (error) {
            console.error('天気とれなかった...', error);
        } finally {
            setLoading(false);
        }
    };

    // 天気コード変換
    const getWeatherInfo = (code: number) => {
        if (code === 0 || code === 1) return { icon: Sun, label: 'Clear', color: 'text-orange-500' };
        if (code === 2 || code === 3) return { icon: Cloud, label: 'Cloudy', color: 'text-gray-500' };
        if (code === 45 || code === 48) return { icon: Cloud, label: 'Fog', color: 'text-gray-400' };
        if (code >= 51 && code <= 67) return { icon: CloudDrizzle, label: 'Rain', color: 'text-blue-500' };
        if (code >= 71 && code <= 77) return { icon: CloudSnow, label: 'Snow', color: 'text-cyan-500' };
        if (code >= 80 && code <= 82) return { icon: CloudRain, label: 'Rain', color: 'text-indigo-500' };
        if (code >= 85 && code <= 86) return { icon: CloudSnow, label: 'Snow', color: 'text-cyan-600' };
        if (code >= 95) return { icon: CloudLightning, label: 'Storm', color: 'text-purple-500' };

        return { icon: Sun, label: '-', color: 'text-gray-400' };
    };

    return {
        weather,
        loading,
        getWeatherInfo
    };
}