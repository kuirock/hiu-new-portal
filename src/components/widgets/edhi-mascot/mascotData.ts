import type { EmotionType } from './useEdhiMascot';

export interface MessageData {
    text: string;
    emotion: EmotionType;
}

// 💖 褒めて！の語彙力強化版（短く、深く、気持ちよく！）
export const PRAISE_MESSAGES: MessageData[] = [
    // 存在肯定
    { text: "え、天才？", emotion: 'shock' },
    { text: "存在が国宝級✨", emotion: 'excited' },
    { text: "息してるだけで偉業", emotion: 'cry' },
    { text: "今日も顔が良い！", emotion: 'wink' },
    { text: "生きててくれて感謝🙏", emotion: 'happy' },
    { text: "推せる...尊い...", emotion: 'shy' },

    // 能力肯定
    { text: "その発想はなかった！", emotion: 'shock' },
    { text: "作業早すぎない？", emotion: 'panic' },
    { text: "コードが美しい...", emotion: 'thinking' },
    { text: "君なら絶対できる！", emotion: 'serious' },
    { text: "優勝！🏆", emotion: 'excited' },

    // 労い
    { text: "無理しなくていいよ", emotion: 'smile' },
    { text: "私が守るから！", emotion: 'angry' }, // 頼もしい感じで
    { text: "よしよし(撫)", emotion: 'sleepy' },
    { text: "一緒に休も？", emotion: 'default' },
];

// 🔮 占いのバリエーション（クスッとなるネタ系）
export const FORTUNE_MESSAGES: MessageData[] = [
    // 超ラッキー (SSR)
    { text: "大吉！USB一発で刺さる", emotion: 'excited' },
    { text: "神吉！全角スペース発見", emotion: 'shock' },
    { text: "大吉！学食で大盛り無料", emotion: 'happy' },
    { text: "優勝！休講の知らせが届く", emotion: 'wink' },

    // まあまあ (SR)
    { text: "中吉。Wi-Fiが爆速", emotion: 'smile' },
    { text: "吉。バスで座れる", emotion: 'default' },
    { text: "吉。自販機で当たりが出る", emotion: 'excited' },
    { text: "中吉。推しの供給がある", emotion: 'shy' },

    // 微妙・ネタ (N)
    { text: "小吉。充電20%切るかも", emotion: 'panic' },
    { text: "末吉。靴紐がほどける", emotion: 'thinking' },
    { text: "注意！保存忘れてない？", emotion: 'serious' },
    { text: "警戒！変数名のスペルミス", emotion: 'serious' },

    // 残念...？ (Bad)
    { text: "凶。傘忘れた...？", emotion: 'rain' as any }, // rainがなければcryで
    { text: "大凶...私が慰めてあげる", emotion: 'cry' },
    { text: "無。虚無る日も大事", emotion: 'sleepy' },
];