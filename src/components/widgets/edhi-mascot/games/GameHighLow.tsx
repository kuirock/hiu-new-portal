import { ArrowUp, ArrowDown, HelpCircle, RefreshCw } from 'lucide-react';

type Props = {
    logic: any;
};

export function GameHighLow({ logic: hl }: Props) {
    return (
        <div className="flex flex-col h-full bg-indigo-50/30 items-center justify-center p-4">

            {hl.gameState === 'start' ? (
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 mb-2">
                        <HelpCircle size={48} className="text-indigo-200" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-700">High or Low?</p>
                        <p className="text-xs text-gray-500 mt-1">次のカードが大きいか小さいか当ててね</p>
                    </div>
                    <button onClick={hl.startGame} className="bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform mt-2">
                        GAME START
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center w-full max-w-[200px]">
                    <div className="text-4xl font-bold mb-4 text-gray-700 bg-white w-20 h-28 flex items-center justify-center rounded-xl shadow-md border-2 border-indigo-50">
                        {hl.currentCard}
                    </div>
                    {/* eDhiが喋るため、ここのメッセージ表示は不要 */}

                    {hl.gameState === 'playing' ? (
                        <div className="flex gap-4 w-full">
                            <button onClick={() => hl.guess('high')} className="flex-1 flex flex-col items-center gap-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-red-50 hover:border-red-200 transition-all group">
                                <ArrowUp className="text-red-400 group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold text-gray-600">High</span>
                            </button>
                            <button onClick={() => hl.guess('low')} className="flex-1 flex flex-col items-center gap-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-blue-50 hover:border-blue-200 transition-all group">
                                <ArrowDown className="text-blue-400 group-hover:scale-110 transition-transform" /> <span className="text-xs font-bold text-gray-600">Low</span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center w-full">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                                <p className="text-xs text-gray-400">Result</p>
                                <p className="text-2xl font-bold text-gray-700">{hl.score} <span className="text-xs font-normal">wins</span></p>
                            </div>
                            <button onClick={hl.startGame} className="w-full bg-indigo-500 text-white py-3 rounded-full font-bold hover:bg-indigo-600 transition-colors shadow-md active:scale-95">
                                <RefreshCw size={16} className="inline mr-2" /> もう一回
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}