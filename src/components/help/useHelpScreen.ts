import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 eDhiの画像をインポート
import edhiSmile from '../../img/edhi_smile.webp';
import edhiSerious from '../../img/edhi_serious.webp';
import edhiExcited from '../../img/edhi_excited.webp';
import edhiHappy from '../../img/edhi_happy.webp';
import edhiWink from '../../img/edhi_wink.webp';
import edhiDefault from '../../img/edhi_default.webp';
import edhiShy from '../../img/edhi_shy.webp';

// 🌟 各項目のセリフと画像の設定
const REACTION_DATA: Record<string, { image: string, text: string }> = {
    'default': { image: edhiDefault, text: "やっほー！eDhiだよ！✨\n知りたい機能を選んでね！" },
    'item-1': { image: edhiSerious, text: "ニュースは毎日チェック！\n大事な情報を見逃さないでね👀" },
    'item-2': { image: edhiExcited, text: "クイックアクセスは長押しで編集！\n自分好みにしちゃお🚀" },
    'item-3': { image: edhiHappy, text: "ウィジェットも長押しで編集！\neDhiと遊べるゲームもあるよ🎮💕" },
    'item-4': { image: edhiWink, text: "チャットは送信取り消し可能！\n安心してやり取りしてね💬" },
    'item-5': { image: edhiSmile, text: "みんなの投稿でワイワイしよ！\nメガホン📢で告知もできるよ✨" },
    'item-6': { image: edhiShy, text: "プロフィールを充実させて、\n気の合う友達見つけちゃお！🎀" }
};

export function useHelpScreen() {
    const navigate = useNavigate();

    // --- 状態管理（State） ---
    const [activeItem, setActiveItem] = useState<string | undefined>(undefined);
    const [isEdhiMinimized, setIsEdhiMinimized] = useState(false);

    // 🌟 修正：ランダム切り替えのロジック（useEffectとsetInterval）をまるごと削除したよ！🗑️

    // --- ロジック：現在の表示データを計算 ---
    const currentReaction = useMemo(() => {
        return activeItem
            ? REACTION_DATA[activeItem]
            : { image: edhiDefault, text: REACTION_DATA['default'].text };
    }, [activeItem]);

    // --- アクション（関数） ---
    const handleBack = useCallback(() => navigate(-1), [navigate]);
    const toggleEdhiMinimized = useCallback(() => setIsEdhiMinimized(prev => !prev), []);

    return {
        activeItem,
        setActiveItem,
        isEdhiMinimized,
        toggleEdhiMinimized,
        currentReaction,
        handleBack
    };
}