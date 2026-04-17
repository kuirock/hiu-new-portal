import { useState } from 'react';

type Props = {
    logic: any;
};

export function GameJustTimer({ logic: jt }: Props) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handlePress = () => {
        // アニメーションをリセットして再開させる
        setIsAnimating(false);
        setTimeout(() => setIsAnimating(true), 10);
        jt.toggleTimer();
    };

    return (
        <div className="flex flex-col h-full bg-rose-50/30 items-center justify-center p-4">
            <style>{`
                @keyframes ripple-effect {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                .animate-ripple {
                    animation: ripple-effect 0.4s ease-out forwards;
                }
            `}</style>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 w-full max-w-[240px] flex flex-col items-center mb-8">
                <div className="text-5xl font-mono font-bold text-gray-700 tracking-wider tabular-nums">
                    {jt.gameState === 'running' ? '?.??' : (jt.resultTime ? jt.resultTime.toFixed(3) : '0.000')}
                    <span className="text-lg text-gray-400 ml-1">s</span>
                </div>
            </div>

            <button
                onClick={handlePress}
                className={`relative w-32 h-32 rounded-full border-8 shadow-xl flex items-center justify-center transition-all overflow-visible ${jt.gameState === 'running'
                    ? 'bg-rose-500 border-rose-600 text-white animate-pulse scale-105 shadow-rose-200'
                    : 'bg-white border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 active:scale-95'
                    }`}
            >
                {/* ★ 波紋エフェクト (ボタンの外にはみ出てもOKなように) */}
                {isAnimating && (
                    <span className="absolute inset-0 bg-rose-400/30 rounded-full animate-ripple pointer-events-none" />
                )}

                <span className="text-2xl font-bold tracking-widest relative z-10">
                    {jt.gameState === 'idle' ? 'START' : jt.gameState === 'running' ? 'STOP' : 'RETRY'}
                </span>
            </button>

            <p className="text-[10px] text-gray-400 mt-8">5.00秒ピッタリを目指してね！</p>
        </div>
    );
}