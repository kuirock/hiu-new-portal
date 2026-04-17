import {
    Heart, Sparkles, X, Gamepad2, Brain, Zap, HelpCircle,
    MessageCircle, Sun, Moon, Stars, Send
} from 'lucide-react';
import { useEdhiMascot } from './useEdhiMascot';
import { Portal } from '../../ui/Portal';

// ゲームロジックとUIコンポーネント
import { useHighLow, useCodeBreaker, useJustTimer } from './useEdhiGames';
import { GameHighLow } from './games/GameHighLow';
import { GameCodeBreaker } from './games/GameCodeBreaker';
import { GameJustTimer } from './games/GameJustTimer';

// 画像インポート
import imgDefault from '../../../img/edhi_default.webp';
import imgHappy from '../../../img/edhi_happy.webp';
import imgShy from '../../../img/edhi_shy.webp';
import imgAngry from '../../../img/edhi_angry.webp';
import imgPanic from '../../../img/edhi_panic.webp';
import imgShock from '../../../img/edhi_shock.webp';
import imgSleepy from '../../../img/edhi_sleepy.webp';
import imgSerious from '../../../img/edhi_serious.webp';
import imgPout from '../../../img/edhi_pout.webp';
import imgThinking from '../../../img/edhi_thinking.webp';
import imgExcited from '../../../img/edhi_excited.webp';
import imgCry from '../../../img/edhi_cry.webp';
import imgQuestion from '../../../img/edhi_question.webp';
import imgWink from '../../../img/edhi_wink.webp';
import imgSmile from '../../../img/edhi_smile.webp';
import imgBlink from '../../../img/edhi_blink.webp';
import type { EmotionType } from './useEdhiMascot';

const EMOTION_IMAGES: Record<EmotionType, string> = {
    default: imgDefault, happy: imgHappy, shy: imgShy, angry: imgAngry,
    panic: imgPanic, shock: imgShock, sleepy: imgSleepy, serious: imgSerious,
    pout: imgPout, thinking: imgThinking, excited: imgExcited, cry: imgCry,
    question: imgQuestion, wink: imgWink, smile: imgSmile,
    blink: imgBlink,
};

// --- ウィジェット内エフェクト ---
const RainEffect = () => <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">{[...Array(15)].map((_, i) => <div key={i} className="absolute bg-blue-300 w-[1px] h-5 rounded-full animate-rain opacity-70" style={{ left: `${Math.random() * 100}%`, top: `-${Math.random() * 20}%`, animationDuration: `${0.6 + Math.random() * 0.4}s`, animationDelay: `${Math.random()}s` }} />)}</div>;
const SnowEffect = () => <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">{[...Array(20)].map((_, i) => <div key={i} className="absolute bg-white w-1.5 h-1.5 rounded-full animate-snow shadow-[0_0_4px_rgba(255,255,255,0.8)]" style={{ left: `${Math.random() * 100}%`, top: `-${Math.random() * 20}%`, animationDuration: `${4 + Math.random() * 5}s`, animationDelay: `${Math.random() * 3}s`, opacity: 0.7 + Math.random() * 0.3 }} />)}</div>;
const StarryNightEffect = () => <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">{[...Array(20)].map((_, i) => <div key={i} className="absolute bg-yellow-100 rounded-full animate-twinkle shadow-[0_0_2px_rgba(255,255,100,0.8)]" style={{ width: Math.random() < 0.6 ? '2px' : '3px', height: Math.random() < 0.6 ? '2px' : '3px', left: `${Math.random() * 100}%`, top: `${Math.random() * 70}%`, opacity: 0.4 + Math.random() * 0.6, animationDelay: `${Math.random() * 3}s` }} />)}</div>;

// --- ★ 画面全体エフェクト (Portalで表示する用) ---
const ConfettiEffect = () => {
    const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {[...Array(60)].map((_, i) => {
                const color = colors[Math.floor(Math.random() * colors.length)];
                return (
                    <div
                        key={i}
                        className={`absolute w-2 h-4 ${color} edhi-animate-confetti rounded-sm`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-10%`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            transform: `rotate(${Math.random() * 360}deg)`
                        }}
                    />
                );
            })}
        </div>
    );
};

const HeartEffect = () => (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                className="absolute text-pink-400 edhi-animate-float-up opacity-0 drop-shadow-md"
                style={{
                    left: `${5 + Math.random() * 90}%`,
                    bottom: '-10%',
                    animationDuration: `${3 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 1}s`,
                }}
            >
                <Heart className="fill-current w-8 h-8 md:w-12 md:h-12" />
            </div>
        ))}
    </div>
);

// ■ 共通ゲームモーダル
const GameModal = ({
    children, onClose, mascotImage, message
}: {
    children: React.ReactNode, onClose: () => void, mascotImage: string, message: string
}) => {
    const stopPropagation = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onPointerDown={stopPropagation}
            onTouchStart={stopPropagation}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            onContextMenu={(e) => { e.preventDefault(); stopPropagation(e); }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => { stopPropagation(e); onClose(); }} />

            <div className="relative w-full max-w-[340px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-4 ring-indigo-50 flex flex-col max-h-[85vh]">
                <div className="bg-indigo-50/50 px-4 py-2 flex items-center gap-3 border-b border-indigo-100 shrink-0 min-h-[60px]">
                    <img src={mascotImage} alt="eDhi" className="w-10 h-10 object-contain drop-shadow-sm" />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-xs text-gray-600 font-medium leading-tight">{message}</p>
                    </div>
                    <button onClick={(e) => { stopPropagation(e); onClose(); }} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 scrollbar-thin scrollbar-thumb-gray-200" onPointerDown={stopPropagation} onTouchStart={stopPropagation}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export function EdhiMascotWidget() {
    const {
        currentEmotion, message, showBubble, isBouncing,
        handleClick, widgetRef, isVisible, timeZone, weather,
        mode, toggleMode, triggerPraise, triggerFortune,
        showConfetti, showHearts, isFortuneTelling,
        liveComments, inputText, setInputText, sendComment
    } = useEdhiMascot();

    const hl = useHighLow();
    const cb = useCodeBreaker();
    const jt = useJustTimer();

    const timeStyles = {
        morning: { bg: "bg-gradient-to-b from-sky-100 to-orange-100", icon: Sun, iconColor: "text-orange-400", overlay: "bg-orange-200/10 mix-blend-overlay" },
        day: { bg: "bg-gradient-to-b from-blue-50 to-white", icon: Sun, iconColor: "text-orange-400", overlay: "bg-transparent" },
        evening: { bg: "bg-gradient-to-b from-orange-200 to-purple-200", icon: Sun, iconColor: "text-orange-500", overlay: "bg-orange-500/10 mix-blend-multiply" },
        night: { bg: "bg-gradient-to-b from-[#2563eb] to-[#1e3a8a]", icon: Moon, iconColor: "text-yellow-200", overlay: "bg-indigo-900/10 mix-blend-multiply" },
        midnight: { bg: "bg-gradient-to-b from-[#4338ca] to-[#1e1b4b]", icon: Stars, iconColor: "text-purple-200", overlay: "bg-black/20 mix-blend-multiply" },
    };

    const baseStyle = timeStyles[timeZone];
    const DisplayIcon = baseStyle.icon;
    const iconColor = baseStyle.iconColor;
    const showStars = (timeZone === 'night' || timeZone === 'midnight');
    const weatherOverlay = baseStyle.overlay;
    const currentMascotImage = EMOTION_IMAGES[currentEmotion];

    const containerAnimation = isVisible
        ? (isFortuneTelling ? 'edhi-animate-shake' : (isBouncing ? 'none' : 'edhi-animate-float'))
        : 'none';

    return (
        <>
            <div
                ref={widgetRef}
                className={`rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group h-full min-h-[200px] flex items-end justify-center cursor-pointer select-none hover:shadow-md transition-colors duration-1000 ${baseStyle.bg}`}
                onClick={handleClick}
            >
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse z-50 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                </div>

                {isVisible && showStars && <StarryNightEffect />}
                <div className="absolute top-3 left-3 transition-all duration-1000 opacity-80 z-10">
                    <DisplayIcon className={`w-6 h-6 ${iconColor} ${timeZone === 'morning' && weather === 'sunny' ? 'animate-spin-slow' : ''}`} />
                </div>

                <div className={`absolute top-2 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 transform origin-bottom ${showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4 pointer-events-none'}`}>
                    <div className="bg-white/90 backdrop-blur-sm border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm relative min-w-[100px] text-center">
                        <p className="text-xs font-bold text-gray-600 whitespace-nowrap flex items-center justify-center gap-1">
                            <MessageCircle className="w-3 h-3 text-indigo-300" />{message}
                        </p>
                    </div>
                </div>

                <div className={`relative z-10 w-full h-[140px] flex items-end justify-center transition-transform duration-300 ${isBouncing ? '-translate-y-2 scale-105' : ''}`}>
                    <img src={currentMascotImage} alt="eDhi" className="h-full object-contain drop-shadow-sm transition-all duration-300 ease-out"
                        style={{ animation: containerAnimation }} />
                </div>

                <div className="absolute bottom-[44px] left-0 w-full px-2 pointer-events-none z-30 flex flex-col justify-end gap-1 h-20 overflow-hidden mask-image-gradient">
                    {liveComments.map((c) => (
                        <div key={c.id} className="text-[10px] text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg w-fit max-w-[90%] break-words animate-in fade-in slide-in-from-bottom-2 shadow-sm border border-white/10">
                            {c.message}
                        </div>
                    ))}
                </div>

                <div className={`absolute inset-0 z-20 pointer-events-none transition-colors duration-1000 ${baseStyle.overlay}`} />
                <div className={`absolute inset-0 z-20 pointer-events-none transition-colors duration-1000 ${weatherOverlay}`} />
                {isVisible && weather === 'rain' && <RainEffect />}
                {isVisible && weather === 'snow' && <SnowEffect />}

                {showConfetti && <Portal><ConfettiEffect /></Portal>}
                {showHearts && <Portal><HeartEffect /></Portal>}

                <div className="absolute bottom-0 left-0 w-full p-1.5 bg-white/20 backdrop-blur-md border-t border-white/30 z-40" onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={sendComment} className="flex gap-1">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="エディにコメント..."
                            className="flex-1 text-[10px] px-2 py-1.5 rounded-md bg-white/80 border border-transparent focus:border-indigo-300 focus:outline-none focus:bg-white text-gray-700 placeholder-gray-400 shadow-inner"
                        />
                        <button type="submit" disabled={!inputText.trim()} className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white p-1.5 rounded-md transition-colors flex items-center justify-center shadow-sm">
                            <Send size={12} />
                        </button>
                    </form>
                </div>

                {mode === 'normal' && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 w-[90%] max-w-[240px] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                        <button onClick={(e) => { e.stopPropagation(); toggleMode('menu_game'); }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full border border-indigo-100 shadow-sm text-indigo-600 hover:scale-105 transition-all active:scale-95">
                            <Gamepad2 size={14} /><span className="text-[10px] font-bold">遊ぶ</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); triggerPraise(); }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full border border-pink-100 shadow-sm text-pink-500 hover:scale-105 transition-all active:scale-95">
                            <Heart size={14} className="fill-pink-500/20" /><span className="text-[10px] font-bold">褒めて</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); triggerFortune(); }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full border border-purple-100 shadow-sm text-purple-600 hover:scale-105 transition-all active:scale-95">
                            <Sparkles size={14} /><span className="text-[10px] font-bold">占い</span>
                        </button>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 opacity-60 z-30" />
            </div>

            <style>{`
                @keyframes edhi-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
                @keyframes edhi-rain { 0% { transform: translateY(-10px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(160px); opacity: 0; } }
                @keyframes edhi-snow { 0% { transform: translateY(-10px) translateX(0); } 100% { transform: translateY(160px) translateX(10px); } }
                @keyframes edhi-twinkle { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
                
                @keyframes edhi-confetti { 
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; } 
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } 
                }
                @keyframes edhi-float-up {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    20% { opacity: 1; transform: translateY(-20px) scale(1); }
                    100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
                }
                @keyframes edhi-shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-5px) rotate(-5deg); }
                    50% { transform: translateX(5px) rotate(5deg); }
                    75% { transform: translateX(-5px) rotate(-5deg); }
                    100% { transform: translateX(0); }
                }

                .edhi-animate-float { animation: edhi-float 3s ease-in-out infinite; }
                .animate-rain { animation: edhi-rain linear infinite; }
                .animate-snow { animation: edhi-snow linear infinite; }
                .animate-twinkle { animation: edhi-twinkle 3s ease-in-out infinite; }
                
                .edhi-animate-confetti { animation-timing-function: ease-out; animation-fill-mode: forwards; }
                .edhi-animate-float-up { animation-timing-function: ease-out; animation-fill-mode: forwards; }
                .edhi-animate-shake { animation: edhi-shake 0.1s linear infinite; }

                .animate-spin-slow { animation: spin 10s linear infinite; }
                .game-btn-lg { @apply flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border shadow-sm hover:shadow-md active:scale-95 bg-white; }
                
                .mask-image-gradient {
                    mask-image: linear-gradient(to top, black 60%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to top, black 60%, transparent 100%);
                }
            `}</style>

            {mode === 'menu_game' && (
                <Portal>
                    <GameModal onClose={() => toggleMode('normal')} mascotImage={EMOTION_IMAGES['happy']} message="どれで遊ぶ？">
                        <div className="flex flex-col items-center justify-center p-6 gap-4 min-h-full">
                            <h3 className="text-lg font-bold text-gray-600 mb-2 tracking-widest border-b-2 border-indigo-100 pb-1">GAME SELECT</h3>
                            <div className="flex flex-col gap-3 w-full">
                                <button onClick={() => { toggleMode('game_highlow'); }} className="game-btn-lg border-indigo-100 hover:border-indigo-300">
                                    <div className="p-2 bg-indigo-50 rounded-full text-indigo-600"><HelpCircle size={20} /></div>
                                    <div className="text-left"><div className="text-sm font-bold text-gray-700">High & Low</div><div className="text-[10px] text-gray-400">直感で勝負！</div></div>
                                </button>
                                <button onClick={() => { toggleMode('game_code'); }} className="game-btn-lg border-emerald-100 hover:border-emerald-300">
                                    <div className="p-2 bg-emerald-50 rounded-full text-emerald-600"><Brain size={20} /></div>
                                    <div className="text-left"><div className="text-sm font-bold text-gray-700">Code Breaker</div><div className="text-[10px] text-gray-400">3桁の数字を推理</div></div>
                                </button>
                                <button onClick={() => { toggleMode('game_timer'); }} className="game-btn-lg border-rose-100 hover:border-rose-300">
                                    <div className="p-2 bg-rose-50 rounded-full text-rose-600"><Zap size={20} /></div>
                                    <div className="text-left"><div className="text-sm font-bold text-gray-700">Just Timer</div><div className="text-[10px] text-gray-400">5.00秒で止めろ</div></div>
                                </button>
                            </div>
                        </div>
                    </GameModal>
                </Portal>
            )}

            {mode === 'game_code' && (
                <Portal>
                    <GameModal onClose={() => toggleMode('menu_game')} mascotImage={currentMascotImage} message={cb.message || "数字を当ててね！"}>
                        <GameCodeBreaker logic={cb} />
                    </GameModal>
                </Portal>
            )}

            {mode === 'game_highlow' && (
                <Portal>
                    <GameModal onClose={() => toggleMode('menu_game')} mascotImage={currentMascotImage} message={hl.message || "次はどっち？"}>
                        <GameHighLow logic={hl} />
                    </GameModal>
                </Portal>
            )}

            {mode === 'game_timer' && (
                <Portal>
                    <GameModal onClose={() => toggleMode('menu_game')} mascotImage={currentMascotImage} message={jt.message || "5秒ピッタリで！"}>
                        <GameJustTimer logic={jt} />
                    </GameModal>
                </Portal>
            )}
        </>
    );
}