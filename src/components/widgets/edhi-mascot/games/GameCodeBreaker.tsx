import { Brain, Delete, HelpCircle, Play } from 'lucide-react';

type Props = {
    logic: any;
};

export function GameCodeBreaker({ logic: cb }: Props) {
    return (
        <div className="flex flex-col h-full bg-emerald-50/50">
            {/* ▼ スタート画面：ここでルール説明をするよ！ */}
            {cb.gameState === 'start' ? (
                <div className="p-4 flex flex-col items-center h-full overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200">
                    <h3 className="text-sm font-bold text-emerald-600 mb-3 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                        <HelpCircle size={16} /> 遊び方ガイド
                    </h3>

                    <div className="w-full space-y-4 mb-4">
                        {/* STEP 1: 目的 */}
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100">
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">基本ルール</span>
                            <p className="text-xs font-bold text-gray-700 mt-1">
                                eDhiが決めた <span className="text-emerald-600 text-sm">3桁の数字</span> を当ててね！
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">※数字の重複はありません (112などは無し)</p>
                        </div>

                        {/* STEP 2: 用語解説 (ここが重要！) */}
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-emerald-100 space-y-3">
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">ヒントの見方</span>

                            {/* EATの説明 */}
                            <div className="flex flex-col gap-1 bg-rose-50 p-2 rounded-lg border border-rose-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded shadow-sm">EAT (イート)</span>
                                    <span className="text-xs font-bold text-rose-600">＝ 場所も数字も正解！🎯</span>
                                </div>
                                <p className="text-[10px] text-gray-600 leading-relaxed pl-1">
                                    数字も合ってるし、桁の場所も合ってる！<br />
                                    <span className="text-rose-500 font-bold opacity-80">→ その数字は確定！動かさないで！</span>
                                </p>
                            </div>

                            {/* BITEの説明 */}
                            <div className="flex flex-col gap-1 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white bg-yellow-500 px-2 py-0.5 rounded shadow-sm">BITE (バイト)</span>
                                    <span className="text-xs font-bold text-yellow-700">＝ 場所が違うけど惜しい！🤔</span>
                                </div>
                                <p className="text-[10px] text-gray-600 leading-relaxed pl-1">
                                    使ってる数字は合ってるけど、場所が違う。<br />
                                    <span className="text-yellow-600 font-bold opacity-80">→ その数字を別の桁に移動させよう！</span>
                                </p>
                            </div>

                            {/* 具体例 */}
                            <div className="border-t border-gray-100 pt-2 mt-1">
                                <p className="text-[10px] font-bold text-gray-400 mb-2 text-center">- 具体例で見てみよう -</p>
                                <div className="bg-gray-800 text-white rounded-lg p-2 font-mono text-xs shadow-inner">
                                    <div className="flex justify-between border-b border-gray-600 pb-1 mb-1">
                                        <span className="text-emerald-400 font-bold">正解: 1 2 3</span>
                                    </div>
                                    <div className="space-y-1.5 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span>予想: <span className="text-rose-400 font-bold bg-rose-900/50 px-1 rounded">1</span> 5 9</span>
                                            <span className="text-[10px] text-rose-300">→ 1 EAT (1は場所も正解)</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>予想: 4 <span className="text-yellow-400 font-bold bg-yellow-900/50 px-1 rounded">1</span> 9</span>
                                            <span className="text-[10px] text-yellow-300">→ 1 BITE (1は場所が違う)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={cb.startGame}
                        className="w-full bg-emerald-500 text-white py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 mt-auto hover:bg-emerald-600 group"
                    >
                        <Play size={18} className="fill-current group-hover:scale-110 transition-transform" /> わかった！ゲーム開始！
                    </button>
                </div>
            ) : (
                /* ▼ プレイ画面 (ここは以前と同じデザイン) */
                <div className="flex flex-col h-full p-2">
                    {/* 履歴エリア */}
                    <div className="flex-1 bg-white border border-emerald-100 rounded-xl p-2 mb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-100 shadow-inner min-h-0 relative">
                        {cb.history.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                                <Brain size={48} className="mb-2 opacity-10" />
                                <p className="text-xs font-bold opacity-40">数字を3つ選んでGo!</p>
                            </div>
                        )}
                        {cb.history.map((h: any, i: number) => (
                            <div key={i} className="flex justify-between items-center border-b border-gray-50 py-2 last:border-0 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                <div className="flex gap-2 items-center">
                                    <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-mono">{String(i + 1).padStart(2, '0')}</span>
                                    <div className="flex gap-0.5">
                                        {h.guess.split('').map((n: string, idx: number) => (
                                            <span key={idx} className="w-5 h-6 bg-gray-50 border border-gray-200 rounded text-center leading-6 text-sm font-bold text-gray-700 font-mono">
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-1.5 text-xs font-bold">
                                    {h.eat > 0 && <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 shadow-sm">{h.eat} EAT</span>}
                                    {h.bite > 0 && <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100 shadow-sm">{h.bite} BITE</span>}
                                    {h.eat === 0 && h.bite === 0 && <span className="text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">ハズレ</span>}
                                </div>
                            </div>
                        ))}
                        {cb.gameState === 'clear' && (
                            <div className="sticky bottom-0 left-0 right-0 p-3 bg-rose-500/90 backdrop-blur text-white rounded-lg text-center mt-2 animate-bounce shadow-lg z-10">
                                <p className="font-bold text-lg">🎉 PERFECT!! 🎉</p>
                                <p className="text-xs opacity-90">{cb.history.length}回でクリア！天才！</p>
                            </div>
                        )}
                    </div>

                    {/* 入力エリア */}
                    {cb.gameState === 'playing' ? (
                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-lg ring-1 ring-emerald-50">
                            <div className="flex justify-center gap-2 mb-3">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className={`w-12 h-14 rounded-xl flex items-center justify-center font-bold text-3xl transition-all shadow-inner ${cb.input[i] !== undefined ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-400' : 'bg-gray-50 border-2 border-gray-100 text-gray-200'}`}>
                                        {cb.input[i]}
                                    </div>
                                ))}
                                <button
                                    onClick={cb.submitGuess}
                                    disabled={cb.input.length !== 3}
                                    className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-5 font-bold disabled:opacity-30 disabled:bg-gray-300 shadow-md active:translate-y-1 transition-all flex flex-col items-center justify-center min-w-[60px]"
                                >
                                    <span className="text-xs opacity-80 mb-[-2px]">CHECK</span>
                                    <span className="text-lg">GO</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => cb.enterNum(n)}
                                        disabled={cb.input.includes(n)}
                                        className="h-10 bg-white border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 text-gray-600 rounded-lg text-xl font-bold active:bg-emerald-50 disabled:opacity-20 disabled:border-none disabled:shadow-none transition-all hover:bg-gray-50"
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button onClick={cb.deleteNum} className="col-span-2 h-10 bg-rose-50 text-rose-400 border-b-4 border-rose-100 active:border-b-0 active:translate-y-1 rounded-lg flex items-center justify-center active:bg-rose-100 hover:text-rose-600 transition-colors">
                                    <Delete size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={cb.startGame} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-lg">
                            もう一回遊ぶ！🔄
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}