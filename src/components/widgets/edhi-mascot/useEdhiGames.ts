import { useState } from 'react';

// 共通の型定義
export type GameResult = 'win' | 'lose' | 'draw' | 'none';

// ■ 1. High & Low Logic
export function useHighLow() {
    const [currentCard, setCurrentCard] = useState<number>(0); // 1-13
    const [nextCard, setNextCard] = useState<number>(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
    const [message, setMessage] = useState('');

    const startGame = () => {
        const c = Math.floor(Math.random() * 13) + 1;
        setCurrentCard(c);
        setScore(0);
        setGameState('playing');
        setMessage('次は大きい？小さい？');
    };

    const guess = (choice: 'high' | 'low') => {
        const next = Math.floor(Math.random() * 13) + 1;
        setNextCard(next);

        // 勝敗判定 (同じ数字は「負け」扱いの厳しめルール！)
        const isWin = (choice === 'high' && next > currentCard) ||
            (choice === 'low' && next < currentCard);

        if (isWin) {
            setScore(s => s + 1);
            setMessage('正解！すごい！✨');
            // 次のターンへ（今のカードを更新）
            setTimeout(() => {
                setCurrentCard(next);
                setMessage('次はどうかな？');
            }, 1000);
        } else {
            setGameState('result');
            setMessage(next === currentCard ? '同じ数字...残念💦' : 'ハズレ～ドンマイ！');
        }
    };

    return { currentCard, nextCard, score, gameState, message, startGame, guess };
}

// ■ 2. Code Breaker Logic (3桁当て)
export function useCodeBreaker() {
    const [secretCode, setSecretCode] = useState<number[]>([]);
    const [input, setInput] = useState<number[]>([]);
    const [history, setHistory] = useState<{ guess: string, eat: number, bite: number }[]>([]);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'clear'>('start');
    const [message, setMessage] = useState('');

    const startGame = () => {
        // 重複なしの3桁を作る
        const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const code = [];
        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * nums.length);
            code.push(nums[idx]);
            nums.splice(idx, 1);
        }
        setSecretCode(code);
        setHistory([]);
        setInput([]);
        setGameState('playing');
        setMessage('3桁の数字を当ててね！');
    };

    const enterNum = (num: number) => {
        if (input.length >= 3) return;
        if (input.includes(num)) return; // 重複入力禁止
        setInput([...input, num]);
    };

    const deleteNum = () => {
        setInput(input.slice(0, -1));
    };

    const submitGuess = () => {
        if (input.length !== 3) return;

        let eat = 0;
        let bite = 0;

        input.forEach((val, idx) => {
            if (val === secretCode[idx]) eat++;
            else if (secretCode.includes(val)) bite++;
        });

        const newHistory = [...history, { guess: input.join(''), eat, bite }];
        setHistory(newHistory);
        setInput([]);

        if (eat === 3) {
            setGameState('clear');
            setMessage(`正解！${newHistory.length}回でクリア！🎉`);
        } else {
            setMessage(`${eat} EAT - ${bite} BITE`);
        }
    };

    return { input, history, gameState, message, startGame, enterNum, deleteNum, submitGuess };
}

// ■ 3. Just Timer Logic (5.00秒止め)
export function useJustTimer() {
    const [startTime, setStartTime] = useState(0);
    const [resultTime, setResultTime] = useState<number | null>(null);
    const [gameState, setGameState] = useState<'idle' | 'running' | 'result'>('idle');
    const [message, setMessage] = useState('');

    const toggleTimer = () => {
        if (gameState === 'idle' || gameState === 'result') {
            // スタート
            setStartTime(Date.now());
            setResultTime(null);
            setGameState('running');
            setMessage('5.00秒で止めて！');
        } else {
            // ストップ
            const diff = (Date.now() - startTime) / 1000;
            setResultTime(diff);
            setGameState('result');

            // 判定
            const diffAbs = Math.abs(diff - 5.0);
            if (diffAbs <= 0.05) setMessage('神業！ピッタリ！🎉');
            else if (diffAbs <= 0.2) setMessage('おしい！あと少し！');
            else if (diffAbs <= 0.5) setMessage('まあまあかな？');
            else setMessage('全然ダメ～😜');
        }
    };

    return { resultTime, gameState, message, toggleTimer };
}