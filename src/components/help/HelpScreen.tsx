import {
    BookOpen, ArrowLeft, Bell, Zap, Puzzle, MessageCircle, MessageSquare, User,
    Lightbulb, Bookmark, Search, Hand, CalendarDays, Bus, Utensils, Gamepad2
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";

// 🌟 さっき作ったロジック（カスタムフック）を読み込む！
import { useHelpScreen } from './useHelpScreen';

// 🌟 まばたき用の画像だけUI側でインポート
import edhiBlink from '../../img/edhi_blink.webp';

export function HelpScreen() {
    // 🌟 ロジックを呼び出して、必要なデータと関数を受け取るだけ！超スッキリ！✨
    const {
        activeItem,
        setActiveItem,
        isEdhiMinimized,
        toggleEdhiMinimized,
        currentReaction,
        handleBack
    } = useHelpScreen();

    return (
        <div className="flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100dvh-40px)] bg-[#f8fafc] rounded-2xl md:shadow-sm md:border border-gray-200 overflow-hidden relative">

            <style>{`
                @keyframes blink {
                    0%, 96%, 98%, 100% { opacity: 0; }
                    97%, 99% { opacity: 1; }
                }
                .edhi-blink { animation: blink 5s linear infinite; }
            `}</style>

            {/* --- ヘッダー --- */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center gap-4 shrink-0 z-20">
                <button
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-indigo-600">
                    <BookOpen className="w-6 h-6" />
                    <h1 className="text-xl font-bold">このポータルの使い方</h1>
                </div>
            </div>

            {/* --- コンテンツ全体 --- */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0">

                {/* 👈 左側：説明書（アコーディオン）エリア */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar pb-36 md:pb-6">

                    {/* スマホ用案内メッセージ */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden md:hidden shrink-0">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50"></div>
                        <p className="text-sm font-bold text-indigo-800 leading-relaxed relative z-10">
                            知りたい機能をタップしてね！👇<br />
                            右下のeDhiをタップすると、邪魔にならないように下に隠れるよ🌱
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4">
                        <Accordion type="single" collapsible className="w-full" value={activeItem} onValueChange={setActiveItem}>

                            {/* 1. ニュース */}
                            <AccordionItem value="item-1" className="border-b-0 mb-2">
                                <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-xl transition-all data-[state=open]:bg-yellow-50 data-[state=open]:text-yellow-700">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-100 p-2 rounded-lg"><Bell className="w-5 h-5 text-yellow-600" /></div>
                                        <span className="font-bold text-[15px]">ニュース (お知らせ)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-4 pb-6 text-gray-600 space-y-4">
                                    <div>
                                        <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> 便利な使い方</h4>
                                        <p className="text-sm leading-relaxed mb-3">大学からの大事なお知らせが流れてくるよ！スマホみたいに<strong>サクサク下へスクロール</strong>して過去の記事も読めるよ📱✨</p>
                                        <ul className="list-disc list-inside text-sm space-y-2 ml-1 leading-relaxed">
                                            <li><strong>タブでソート機能：</strong>上のタブをスワイプして見たい記事を一瞬で絞り込めるよ！</li>
                                            <li><strong><Bookmark className="w-3.5 h-3.5 inline text-orange-500" /> ブックマーク機能：</strong>あとで読み返したい記事は、右側のしおりマークをタップ！</li>
                                            <li><strong><Search className="w-3.5 h-3.5 inline text-gray-500" /> 検索機能：</strong>右上の虫眼鏡マークからキーワード検索もできるよ！</li>
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 2. クイックアクセス */}
                            <AccordionItem value="item-2" className="border-b-0 mb-2">
                                <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-xl transition-all data-[state=open]:bg-emerald-50 data-[state=open]:text-emerald-700">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-100 p-2 rounded-lg"><Zap className="w-5 h-5 text-emerald-600" /></div>
                                        <span className="font-bold text-[15px]">クイックアクセス</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-4 pb-6 text-gray-600 space-y-4">
                                    <div>
                                        <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> 便利な使い方</h4>
                                        <p className="text-sm leading-relaxed mb-3">Moodleやシラバスなど、よく使うサイトへ1タップで飛べる最強のショートカット集だよ！🚀</p>
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <h5 className="flex items-center gap-2 font-bold text-blue-800 mb-2 text-sm"><Hand className="w-4 h-4" /> 長押しで編集モード！</h5>
                                            <p className="text-sm text-blue-700 leading-relaxed">アイコンを<strong>「長押し」</strong>すると編集モードに入るよ！好きなサイトを追加したり並べ替えたりして自分専用にカスタマイズしちゃお✨</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 3. ウィジェット */}
                            <AccordionItem value="item-3" className="border-b-0 mb-2">
                                <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-xl transition-all data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg"><Puzzle className="w-5 h-5 text-blue-600" /></div>
                                        <span className="font-bold text-[15px]">ウィジェット (ホーム画面)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-2 sm:px-4 pt-4 pb-6 text-gray-600 space-y-4">
                                    <div>
                                        <p className="text-sm leading-relaxed mb-4 px-2">ホーム画面に好きな機能のブロックを並べられる機能だよ。ここでも<strong>「長押し」</strong>で編集モードに入って、サイズの変更や並べ替えができるよ！🧩</p>
                                        <h5 className="font-bold text-gray-700 text-sm mb-2 px-2">👇各ウィジェットの詳しい使い方（タップで開くよ）</h5>

                                        <Accordion type="single" collapsible className="w-full bg-gray-50/50 rounded-xl border border-gray-100 p-2">
                                            <AccordionItem value="widget-schedule" className="border-b-0">
                                                <AccordionTrigger className="hover:bg-gray-100 px-3 py-2 rounded-lg text-sm">
                                                    <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-indigo-500" /> 時間割</div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-3 pb-3 text-xs text-gray-600 leading-relaxed">右上の「編集」から自分の受けている授業と教室を登録できるよ！🏫</AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="widget-bus" className="border-b-0">
                                                <AccordionTrigger className="hover:bg-gray-100 px-3 py-2 rounded-lg text-sm">
                                                    <div className="flex items-center gap-2"><Bus className="w-4 h-4 text-teal-500" /> バス時刻表</div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-3 pb-3 text-xs text-gray-600 leading-relaxed">次のバスをリアルタイムでカウントダウン！「大学行き」と「駅行き」の切り替えができるよ！🚌💨</AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="widget-cafeteria" className="border-b-0">
                                                <AccordionTrigger className="hover:bg-gray-100 px-3 py-2 rounded-lg text-sm">
                                                    <div className="flex items-center gap-2"><Utensils className="w-4 h-4 text-orange-500" /> 学食メニュー</div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-3 pb-3 text-xs text-gray-600 leading-relaxed">今日の学食のメニューやカロリー情報が見れるよ😋</AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="widget-games" className="border-b-0">
                                                <AccordionTrigger className="hover:bg-gray-100 px-3 py-2 rounded-lg text-sm">
                                                    <div className="flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-pink-500" /> eDhiと遊ぶ</div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-3 pb-3 text-xs text-gray-600 leading-relaxed space-y-2">
                                                    <p>eDhiをタップすると、空きコマに遊べるミニゲームが起動するよ！🎮</p>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 4. メッセージ */}
                            <AccordionItem value="item-4" className="border-b-0 mb-2">
                                <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-xl transition-all data-[state=open]:bg-green-50 data-[state=open]:text-green-700">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-lg"><MessageCircle className="w-5 h-5 text-green-600" /></div>
                                        <span className="font-bold text-[15px]">メッセージ (個別チャット)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-4 pb-6 text-gray-600 space-y-4">
                                    <div>
                                        <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> どんな機能？</h4>
                                        <p className="text-sm leading-relaxed mb-2">友達と1対1でLINEみたいにやり取りできるチャット機能だよ！💬</p>
                                        <ul className="list-disc list-inside text-sm space-y-1.5 ml-1 leading-relaxed">
                                            <li>画像や動画も送れるからノートを見せ合うのにピッタリ！</li>
                                            <li>自分が送ったメッセージをタップすると、鉛筆マーク✏️で後から直したり、ゴミ箱マーク🗑️で送信取り消しができるよ！</li>
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 5. みんなの投稿 */}
                            <AccordionItem value="item-5" className="border-b-0 mb-2">
                                <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-xl transition-all data-[state=open]:bg-orange-50 data-[state=open]:text-orange-700">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-100 p-2 rounded-lg"><MessageSquare className="w-5 h-5 text-orange-600" /></div>
                                        <span className="font-bold text-[15px]">みんなの投稿 (タイムライン)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-4 pb-6 text-gray-600 space-y-4">
                                    <div>
                                        <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> どんな機能？</h4>
                                        <p className="text-sm leading-relaxed mb-2">アプリを使ってるみんなが見れる、大学内限定のオープンな掲示板だよ！🌟</p>
                                        <ul className="list-disc list-inside text-sm space-y-1.5 ml-1 leading-relaxed">
                                            <li>メガホンマーク📢を使うと『告知』として目立たせることができるよ！（期限が過ぎたら自動で消えるよ👍）</li>
                                            <li>気になった投稿には「いいね❤️」や「コメント💬」をして盛り上がろ〜！</li>
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 6. プロフィール */}
                            <AccordionItem value="item-6" className="border-b-0">
                                <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-xl transition-all data-[state=open]:bg-purple-50 data-[state=open]:text-purple-700">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 p-2 rounded-lg"><User className="w-5 h-5 text-purple-600" /></div>
                                        <span className="font-bold text-[15px]">プロフィール設定</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-4 pb-6 text-gray-600 space-y-4">
                                    <div>
                                        <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> どんな機能？</h4>
                                        <p className="text-sm leading-relaxed mb-2">自分のアイコン画像や、自己紹介文を自由に設定できるページだよ！🎀</p>
                                        <ul className="list-disc list-inside text-sm space-y-1.5 ml-1 leading-relaxed">
                                            <li>学部・学科や趣味を書いておけば、気の合う友達が見つかりやすくなるかも✨</li>
                                            <li>他の人のプロフィールから、直接メッセージ（チャット）を送ることもできるよ！</li>
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </div>
                </div>

                {/* --- 👉 右側：PC版 eDhiエリア --- */}
                <div className="hidden md:flex w-[320px] shrink-0 flex-col items-center justify-center p-6 border-l border-gray-100 bg-white/50 relative">
                    <div className="w-full max-w-[280px] sticky top-1/2 -translate-y-1/2 flex flex-col items-center">

                        {/* フキダシ */}
                        <div key={activeItem || 'default'} className="bg-white p-5 rounded-2xl rounded-br-sm shadow-sm border border-indigo-100 mb-5 w-full relative z-10 animate-in fade-in zoom-in duration-300">
                            <p className="text-sm font-bold text-gray-700 whitespace-pre-wrap leading-relaxed text-center">
                                {currentReaction.text}
                            </p>
                            <div className="absolute -bottom-3 right-10 w-6 h-6 bg-white border-b border-r border-indigo-100 transform rotate-45"></div>
                        </div>

                        {/* 四角いカード枠 */}
                        <div className="relative w-full aspect-square bg-gradient-to-b from-indigo-50/80 to-indigo-100/50 rounded-3xl border border-indigo-100/50 overflow-hidden shadow-sm flex items-end justify-center">
                            <div className="relative w-48 h-48">
                                <img
                                    key={(activeItem || 'default') + '-pc-img'}
                                    src={currentReaction.image}
                                    alt="eDhi"
                                    className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-300"
                                />
                                {!activeItem && (
                                    <img src={edhiBlink} alt="blink" className="absolute inset-0 w-full h-full object-contain object-bottom edhi-blink" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 📱 スマホ版：ひょっこりスタイル --- */}
            <div
                className={`md:hidden fixed right-4 z-40 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col items-end ${isEdhiMinimized ? 'translate-y-[calc(100%-100px)] bottom-0' : 'translate-y-0 bottom-0'
                    }`}
            >
                {/* 吹き出し */}
                <div className={`transition-opacity duration-300 ${isEdhiMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div key={activeItem || 'default'} className="bg-white p-3 rounded-2xl rounded-br-sm shadow-lg border border-indigo-100 mb-2 max-w-[200px] relative">
                        <p className="text-sm font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {currentReaction.text}
                        </p>
                        <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white border-b border-r border-indigo-100 transform rotate-45"></div>
                    </div>
                </div>

                {/* eDhi本体 */}
                <div
                    className="relative w-36 h-36 cursor-pointer drop-shadow-xl"
                    onClick={toggleEdhiMinimized}
                >
                    <img
                        key={(activeItem || 'default') + '-mobile-img'}
                        src={currentReaction.image}
                        alt="eDhi"
                        className="absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-300"
                    />
                    {!activeItem && (
                        <img src={edhiBlink} alt="blink" className="absolute inset-0 w-full h-full object-contain object-bottom edhi-blink" />
                    )}
                </div>
            </div>

        </div>
    );
}