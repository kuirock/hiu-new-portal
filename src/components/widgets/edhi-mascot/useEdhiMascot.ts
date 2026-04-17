import { useState, useEffect, useRef, useCallback } from 'react';
import { PRAISE_MESSAGES, FORTUNE_MESSAGES } from './mascotData';
import { supabase } from '../../../lib/supabase'; // 🌟 パスが合っているか確認してね！

export type EmotionType =
    | 'default' | 'happy' | 'shy' | 'angry'
    | 'panic' | 'shock' | 'sleepy' | 'serious'
    | 'pout' | 'thinking' | 'excited' | 'cry'
    | 'question' | 'wink' | 'smile' | 'blink';

export type TimeZone = 'morning' | 'day' | 'evening' | 'night' | 'midnight';
export type WeatherType = 'sunny' | 'rain' | 'snow' | 'cloudy' | 'thunder';
export type MascotMode = 'normal' | 'menu_game' | 'game_highlow' | 'game_code' | 'game_timer';

interface Reaction {
    text: string;
    emotion: EmotionType;
}

const COMMON_REACTIONS: Reaction[] = [
    { text: "課題終わった？", emotion: 'question' },
    { text: "今日もえらい！", emotion: 'happy' },
    { text: "進捗どうですか？", emotion: 'serious' },
    { text: "わーい！", emotion: 'excited' },
    { text: "ん？", emotion: 'default' },
    { text: "eDhiだよ！", emotion: 'wink' },
    { text: "照れるなぁ...", emotion: 'shy' },
    { text: "えぇ！？", emotion: 'shock' },
    { text: "なるほど...", emotion: 'thinking' },
    { text: "にひひ", emotion: 'smile' },
];

export function useEdhiMascot() {
    // 状態管理
    const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('default');
    const [message, setMessage] = useState('なになに？');
    const [showBubble, setShowBubble] = useState(false);
    const [isBouncing, setIsBouncing] = useState(false);

    // おみくじ演出中のフラグ
    const [isFortuneTelling, setIsFortuneTelling] = useState(false);

    // エフェクト用のState
    const [showConfetti, setShowConfetti] = useState(false);
    const [showHearts, setShowHearts] = useState(false);

    const [timeZone, setTimeZone] = useState<TimeZone>('day');
    const [weather, setWeather] = useState<WeatherType>('sunny');
    const [isVisible, setIsVisible] = useState(true);
    const [mode, setMode] = useState<MascotMode>('normal');

    // ★ ライバー配信用State
    const [liveComments, setLiveComments] = useState<{ id: string, message: string }[]>([]);
    const [inputText, setInputText] = useState('');

    const widgetRef = useRef<HTMLDivElement>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 時間帯判定
    const checkTime = useCallback(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 16) return 'day';
        if (hour >= 16 && hour < 19) return 'evening';
        if (hour >= 19 && hour < 24) return 'night';
        return 'midnight';
    }, []);

    // 天気取得
    const fetchWeather = useCallback(async () => {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=43.1&longitude=141.5&current_weather=true');
            const data = await res.json();
            const code = data.current_weather.weathercode;
            if (code <= 1) setWeather('sunny');
            else if (code <= 48) setWeather('cloudy');
            else if (code <= 67 || (code >= 80 && code <= 82)) setWeather('rain');
            else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) setWeather('snow');
            else if (code >= 95) setWeather('thunder');
        } catch (e) {
            console.error("天気取れなかった...", e);
            setWeather('sunny');
        }
    }, []);

    useEffect(() => {
        setTimeZone(checkTime());
        fetchWeather();
        const timeInterval = setInterval(() => setTimeZone(checkTime()), 60000);
        const weatherInterval = setInterval(fetchWeather, 30 * 60000);
        return () => {
            clearInterval(timeInterval);
            clearInterval(weatherInterval);
        };
    }, [checkTime, fetchWeather]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (widgetRef.current) observer.observe(widgetRef.current);
        return () => observer.disconnect();
    }, []);

    // ★ ライバー風のリアクション生成
    const generateLiverReaction = (msg: string) => {
        const reactions = [
            { text: `「${msg}」...それな！`, emotion: 'happy' as EmotionType },
            { text: `「${msg}」ってマジ！？`, emotion: 'shock' as EmotionType },
            { text: `「${msg}」...ありがとー！✨`, emotion: 'smile' as EmotionType },
            { text: `「${msg}」...ふむふむ🤔`, emotion: 'thinking' as EmotionType },
            { text: `えっ、「${msg}」？`, emotion: 'question' as EmotionType },
        ];
        return reactions[Math.floor(Math.random() * reactions.length)];
    };

    const displayMessage = useCallback((text: string, emotion: EmotionType, duration = 3000) => {
        setMessage(text);
        setCurrentEmotion(emotion);
        setShowBubble(true);
        setIsBouncing(true);

        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setShowBubble(false);
            setCurrentEmotion('default');
            setIsBouncing(false);
            setShowConfetti(false);
            setShowHearts(false);
        }, duration);
    }, []);

    // ★ Supabaseのリアルタイム購読
    useEffect(() => {
        const fetchComments = async () => {
            const { data } = await supabase
                .from('edhi_comments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (data) setLiveComments(data.reverse());
        };
        fetchComments();

        console.log("🚀 リアルタイム通信の準備するよー！");

        const channel = supabase.channel('live-comments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'edhi_comments' }, (payload) => {
                // 🌟 ここに受信した時のログを追加！
                console.log("🔥 キタキタ！リアルタイム受信:", payload);

                const newComment = payload.new as { id: string, message: string };
                setLiveComments((prev) => [...prev.slice(-4), newComment]);

                if (Math.random() < 0.3) {
                    const reaction = generateLiverReaction(newComment.message);
                    displayMessage(reaction.text, reaction.emotion, 4000);
                }
            })
            // 🌟 subscribeの中にステータス確認を追加！
            .subscribe((status) => {
                console.log("📡 接続ステータス:", status);
            });

        return () => { supabase.removeChannel(channel); };
    }, [displayMessage]);



    // ★ コメント送信処理
    const sendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        await supabase.from('edhi_comments').insert([{ message: inputText.trim() }]);
        setInputText('');
    };

    const triggerBlink = useCallback(() => {
        if (!isVisible || showBubble || isFortuneTelling) return;
        const rand = Math.random();
        if (rand < 0.1) {
            setCurrentEmotion('blink');
            setTimeout(() => setCurrentEmotion('default'), 150);
        } else if (rand < 0.15) {
            setCurrentEmotion('sleepy');
            setTimeout(() => setCurrentEmotion('default'), 2000);
        }
        const nextBlinkTime = 1000 + Math.random() * 2000;
        blinkTimerRef.current = setTimeout(triggerBlink, nextBlinkTime);
    }, [showBubble, isVisible, isFortuneTelling]);

    useEffect(() => {
        if (isVisible) triggerBlink();
        else {
            if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        }
    }, [isVisible, triggerBlink]);

    const triggerPraise = () => {
        const pick = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
        setShowHearts(true);
        displayMessage(pick.text, pick.emotion);
    };

    const triggerFortune = () => {
        const today = new Date().toDateString();
        const lastFortuneDate = localStorage.getItem('edhi_last_fortune_date');

        if (lastFortuneDate === today) {
            displayMessage("占いは1日1回だよ！また明日ね✨", 'wink');
            return;
        }

        setIsFortuneTelling(true);
        setMessage("ガラガラガラ...");
        setShowBubble(true);
        setCurrentEmotion('panic');

        setTimeout(() => {
            setIsFortuneTelling(false);
            localStorage.setItem('edhi_last_fortune_date', today);
            const pick = FORTUNE_MESSAGES[Math.floor(Math.random() * FORTUNE_MESSAGES.length)];

            setShowConfetti(true);
            displayMessage(pick.text, pick.emotion, 5000);
        }, 2000);
    };

    const toggleMode = (newMode: MascotMode) => {
        setMode(newMode);
        if (newMode === 'menu_game') {
            displayMessage("どのゲームで遊ぶ？", 'happy');
        } else if (newMode === 'normal') {
            displayMessage("なになに？", 'default');
        }
    };

    const handleClick = () => {
        if (mode !== 'normal' || isFortuneTelling) return;
        if (!isVisible || showBubble) return;

        let situationReactions: Reaction[] = [];
        if (weather === 'rain') {
            situationReactions.push(
                { text: "雨だね...", emotion: 'pout' },
                { text: "傘持った？", emotion: 'question' },
                { text: "濡れちゃう〜", emotion: 'panic' }
            );
        } else if (weather === 'snow') {
            situationReactions.push(
                { text: "雪だー！", emotion: 'excited' },
                { text: "寒いねぇ...", emotion: 'sleepy' },
                { text: "滑らないでね", emotion: 'serious' }
            );
        } else if (weather === 'thunder') {
            situationReactions.push(
                { text: "雷こわい...", emotion: 'cry' },
                { text: "へそ隠して！", emotion: 'panic' }
            );
        }

        switch (timeZone) {
            case 'morning': situationReactions.push({ text: "おはよ！", emotion: 'happy' }); break;
            case 'evening': situationReactions.push({ text: "お疲れ様！", emotion: 'wink' }); break;
            case 'night': situationReactions.push({ text: "こんばんは🌙", emotion: 'default' }); break;
            case 'midnight': situationReactions.push({ text: "早く寝なよ", emotion: 'sleepy' }); break;
        }

        const allReactions = [...COMMON_REACTIONS, ...situationReactions];
        const reaction = allReactions[Math.floor(Math.random() * allReactions.length)];

        displayMessage(reaction.text, reaction.emotion);
        setTimeout(() => setIsBouncing(false), 500);
    };

    return {
        currentEmotion, message, showBubble, isBouncing,
        handleClick, widgetRef, isVisible, timeZone, weather,
        mode, toggleMode, triggerPraise, triggerFortune,
        showConfetti, showHearts, isFortuneTelling,
        liveComments, inputText, setInputText, sendComment
    };
}