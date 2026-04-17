import { Menu, X, GripVertical } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'; // 🌟 魔法をインポート！

import { Sidebar } from '../sidebar/Sidebar';
import { ChatScreen } from '../chat/ChatScreen';
import { ProfileScreen } from '../profile/ProfileScreen';
import { ProfileEditModal } from '../profile/ProfileEditModal';
import { LinkGrid } from '../links/LinkGrid';
import { WidgetArea } from '../widgets/container/WidgetArea';
import { NewsFeed } from '../news/NewsFeed';
import { AnnouncementCarousel } from '../posts/AnnouncementCarousel';
import { PostFeed } from '../posts/PostFeed';
import { FacultyScreen } from '../faculty/FacultyScreen';
import { usePostFeed } from '../posts/usePostFeed';
import { HelpScreen } from '../help/HelpScreen';

import { useDashboard, CHARACTER_PROFILE } from './useDashboard';

// 🌟 新規追加：URLに応じてプロフィール画面を出し分ける専用のパーツ！
function ProfileRoute({ session, profile, handleLogout, setIsProfileEditOpen }: any) {
    const { userId } = useParams(); // URLから /profile/〇〇 の 〇〇 を抜き出す！
    const navigate = useNavigate();
    const targetId = userId || session.user.id; // URLにIDがなければ自分のプロフィール！

    return (
        <ProfileScreen
            targetUserId={targetId}
            currentUserId={session.user.id}
            initialProfile={targetId === session.user.id ? profile : null}
            onBack={() => navigate('/')} // 戻るボタンでホーム(/)へ
            onEdit={() => setIsProfileEditOpen(true)}
            onLogout={handleLogout}
            onUserClick={(id: string) => navigate(`/profile/${id}`)} // 誰かのアイコンを押したらその人のURLへ！
            onStartChat={() => navigate('/chat')} // チャットURLへ！
        />
    );
}

interface DashboardProps {
    session: any;
}

export function Dashboard({ session }: DashboardProps) {
    const navigate = useNavigate(); // URLを切り替える魔法！
    const location = useLocation(); // 今のURLを知る魔法！

    const {
        profile,
        loading,
        isSidebarOpen,
        isWidgetOpen,
        isProfileEditOpen,
        setIsSidebarOpen,
        setIsWidgetOpen,
        setIsProfileEditOpen,
        handleLogout,
        refreshProfile
    } = useDashboard(session);

    const [feedVersion, setFeedVersion] = useState(0);
    const mainRef = useRef<HTMLElement>(null); // スクロールする「箱」を捕まえる

    // スクロールした時に、その位置をブラウザに暗記させる
    const handleScroll = useCallback(() => {
        if (mainRef.current) {
            sessionStorage.setItem(`scroll_${location.pathname}`, mainRef.current.scrollTop.toString());
        }
    }, [location.pathname]);

    // 画面が切り替わった時（戻ってきた時）に、暗記していた位置までスクロールする！
    useEffect(() => {
        // 「読み込み中...」が終わったタイミングで実行！
        if (!loading) {
            const savedPos = sessionStorage.getItem(`scroll_${location.pathname}`);
            if (savedPos !== null) {
                // ニュースや告知のデータが届いて「画面の高さ」が確保されるまで、
                // 0.1秒ごとに5回（合計0.5秒間）しつこくスクロール位置を戻し続ける裏技！
                let attempts = 0;
                const intervalId = setInterval(() => {
                    if (mainRef.current) {
                        mainRef.current.scrollTop = parseInt(savedPos, 10);
                    }
                    attempts++;
                    if (attempts >= 5) {
                        clearInterval(intervalId); // 5回やったら諦める（十分間に合う！）
                    }
                }, 100);

                return () => clearInterval(intervalId); // 画面が変わったらリセット
            } else {
                if (mainRef.current) mainRef.current.scrollTop = 0;
            }
        }
    }, [loading, location.pathname]); // 🌟 loading を追加して、読み込み完了を待つようにしたよ！

    const {
        announcements,
        refreshPosts: refreshAnnouncements,
        handleReport,
        handleDelete,
        handleHideAnnouncement,
        handleUnhideAnnouncement,
        handleRemoveAnnouncement,
        handleEditAnnouncement
    } = usePostFeed(session.user.id || "");

    // --- スマホ用スワイプ処理（変更なし） ---
    const [swipeStyle, setSwipeStyle] = useState<{
        sidebar?: React.CSSProperties;
        sidebarOverlay?: React.CSSProperties;
        widget?: React.CSSProperties;
        widgetOverlay?: React.CSSProperties;
    }>({});

    const dragInfo = useRef({
        startX: 0,
        currentX: 0,
        isDragging: false,
        target: null as 'sidebar' | 'widget' | null,
        startWidth: 288,
    });

    const requestRef = useRef<number | undefined>(undefined);
    const DRAG_THRESHOLD = 50;

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('.prevent-swipe')) {
            return;
        }

        const touchX = e.touches[0].clientX;
        const windowWidth = window.innerWidth;
        const edgeThreshold = windowWidth * 0.5;

        dragInfo.current.startX = touchX;
        dragInfo.current.currentX = touchX;
        dragInfo.current.isDragging = true;
        dragInfo.current.target = null;

        if (isSidebarOpen || (touchX < edgeThreshold && !isWidgetOpen)) {
            dragInfo.current.target = 'sidebar';
            dragInfo.current.startWidth = 288;
        }
        else if (isWidgetOpen || (touchX > windowWidth - edgeThreshold && !isSidebarOpen)) {
            dragInfo.current.target = 'widget';
            dragInfo.current.startWidth = 320;
        }
    }, [isSidebarOpen, isWidgetOpen]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (!dragInfo.current.isDragging || !dragInfo.current.target) return;
        const touchX = e.touches[0].clientX;
        dragInfo.current.currentX = touchX;

        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }

        requestRef.current = requestAnimationFrame(() => {
            const diff = dragInfo.current.currentX - dragInfo.current.startX;
            const { target, startWidth } = dragInfo.current;
            const noTransition: React.CSSProperties = { transition: 'none' };

            if (target === 'sidebar') {
                let translateX = 0;
                let opacity = 0;
                if (isSidebarOpen) {
                    translateX = Math.min(0, diff);
                    opacity = 1 - (Math.abs(translateX) / startWidth);
                } else {
                    translateX = Math.min(0, -startWidth + diff);
                    opacity = 1 - (Math.abs(translateX) / startWidth);
                }
                setSwipeStyle({
                    sidebar: { ...noTransition, transform: `translateX(${translateX}px)` },
                    sidebarOverlay: { ...noTransition, opacity: Math.max(0, Math.min(1, opacity)) }
                });
            }
            else if (target === 'widget') {
                let translateX = 0;
                let opacity = 0;
                if (isWidgetOpen) {
                    translateX = Math.max(0, diff);
                    opacity = 1 - (translateX / startWidth);
                } else {
                    translateX = Math.max(0, startWidth + diff);
                    opacity = 1 - (translateX / startWidth);
                }
                setSwipeStyle({
                    widget: { ...noTransition, transform: `translateX(${translateX}px)` },
                    widgetOverlay: { ...noTransition, opacity: Math.max(0, Math.min(1, opacity)) }
                });
            }
        });
    }, [isSidebarOpen, isWidgetOpen]);

    const onTouchEnd = useCallback(() => {
        if (!dragInfo.current.isDragging || !dragInfo.current.target) {
            setSwipeStyle({});
            return;
        }

        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }

        const { startX, currentX, target } = dragInfo.current;
        const diff = currentX - startX;
        const isSwipeLeft = diff < -DRAG_THRESHOLD;
        const isSwipeRight = diff > DRAG_THRESHOLD;

        setSwipeStyle({});
        dragInfo.current.isDragging = false;

        if (target === 'sidebar') {
            if (isSidebarOpen) {
                if (isSwipeLeft) setIsSidebarOpen(false);
            } else {
                if (isSwipeRight) setIsSidebarOpen(true);
            }
        } else if (target === 'widget') {
            if (isWidgetOpen) {
                if (isSwipeRight) setIsWidgetOpen(false);
            } else {
                if (isSwipeLeft) setIsWidgetOpen(true);
            }
        }
    }, [isSidebarOpen, isWidgetOpen, setIsSidebarOpen, setIsWidgetOpen]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-500">読み込み中...</div>;

    // 🌟 現在のURLによって、上のタイトルやサイドバーの色付けを変える！
    let currentView = 'home';
    let headerTitle = 'WebPortal';
    if (location.pathname === '/timeline') {
        currentView = 'timeline';
        headerTitle = 'みんなの投稿';
    } else if (location.pathname.startsWith('/profile')) {
        currentView = 'profile';
        headerTitle = 'プロフィール';
    } else if (location.pathname === '/chat') {
        currentView = 'chat';
        headerTitle = 'メッセージ';
    } else if (location.pathname === '/faculty') {
        currentView = 'faculty';
        headerTitle = '教員不在・連絡先';
    }

    return (
        <div
            className="min-h-screen bg-[#f3f4f6] font-sans text-gray-800 flex overflow-hidden touch-pan-y overscroll-x-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentView={currentView}
                onNavigate={() => { }} // 🌟 Router化で使わなくなったので空でOK！
                onLogout={handleLogout}
                style={swipeStyle.sidebar}
                overlayStyle={swipeStyle.sidebarOverlay}
            />

            <>
                <div
                    className={`fixed inset-0 bg-black/60 z-40 transition-opacity xl:hidden ${isWidgetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsWidgetOpen(false)}
                    style={swipeStyle.widgetOverlay}
                />
                <div
                    className={`fixed top-0 right-0 h-full w-80 bg-[#f3f4f6] shadow-2xl z-50 transform transition-transform duration-300 ease-out xl:hidden overflow-y-auto ${isWidgetOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    style={swipeStyle.widget}
                >
                    <div className="p-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
                        <h2 className="font-bold text-xl tracking-tight">Widgets</h2>
                        <button onClick={() => setIsWidgetOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-4">
                        <WidgetArea userId={session.user.id} profile={profile} />
                    </div>
                </div>
            </>

            <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="xl:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {headerTitle}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 relative xl:hidden"
                            onClick={() => setIsWidgetOpen(true)}
                        >
                            <GripVertical className="w-5 h-5" />
                        </button>

                        <div
                            onClick={() => navigate('/profile')} // 🌟 アイコンタップで /profile へ移動！
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden">
                                <img src={profile?.avatar_url || CHARACTER_PROFILE.image} alt="User" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden md:block">{profile?.username || 'ゲスト'}</span>
                        </div>
                    </div>
                </header>

                <main
                    ref={mainRef} // 🌟 さっきの箱を捕まえる！
                    onScroll={handleScroll} // 🌟 スクロールするたびに暗記させる！
                    className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f3f4f6]"
                >
                    {/* 🌟🌟🌟 ここからURLによって中身を切り替える！ 🌟🌟🌟 */}
                    <Routes>
                        {/* 🏠 / (ホーム画面) */}
                        {/* 🌟🌟🌟 ここが大改造ポイント！！ 🌟🌟🌟 */}
                        {/* max-w-7xl を消して、grid-cols-[1fr_280px] で「メインは自由、右は280px固定」にしたよ！ */}
                        <Route path="/" element={
                            <div className="w-full max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">
                                <div className="space-y-6 min-w-0">
                                    {announcements && announcements.length > 0 && (
                                        <div className="mb-6">
                                            <AnnouncementCarousel
                                                announcements={announcements}
                                                currentUserId={session.user.id}
                                                onReport={handleReport}
                                                onHideAnnouncement={handleHideAnnouncement}
                                                onUnhideAnnouncement={handleUnhideAnnouncement}
                                                onRemoveAnnouncement={handleRemoveAnnouncement}
                                                onEditAnnouncement={handleEditAnnouncement}
                                                onDelete={handleDelete}
                                            />
                                        </div>
                                    )}
                                    <NewsFeed currentUserId={session.user.id} />
                                    <LinkGrid userId={session.user.id} />
                                </div>
                                {/* 🌟 ウィジェットエリアは固定幅の箱に入れる！ */}
                                <div className="hidden xl:block w-[280px] space-y-6">
                                    <WidgetArea userId={session.user.id} profile={profile} />
                                </div>
                            </div>
                        } />

                        {/* 🌟 タイムライン画面も同じように広々レイアウトへ！ */}
                        <Route path="/timeline" element={
                            <div className="w-full max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8">
                                <div className="space-y-6 min-w-0">
                                    <PostFeed
                                        key={feedVersion}
                                        currentUserId={session.user.id}
                                        onAnnouncementCreated={refreshAnnouncements}
                                    />
                                </div>
                                <div className="hidden xl:block w-[280px] space-y-6">
                                    <WidgetArea userId={session.user.id} profile={profile} />
                                </div>
                            </div>
                        } />

                        {/* 👤 /profile (プロフィール画面) */}
                        <Route path="/profile" element={
                            <ProfileRoute
                                session={session}
                                profile={profile}
                                handleLogout={handleLogout}
                                setIsProfileEditOpen={setIsProfileEditOpen}
                            />
                        } />

                        {/* 👤 /profile/〇〇 (他人のプロフィール画面) */}
                        <Route path="/profile/:userId" element={
                            <ProfileRoute
                                session={session}
                                profile={profile}
                                handleLogout={handleLogout}
                                setIsProfileEditOpen={setIsProfileEditOpen}
                            />
                        } />

                        {/* 📱 /chat (メッセージ・チャット画面) */}
                        <Route path="/chat" element={
                            <div className="w-full max-w-5xl mx-auto h-[80vh] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col">
                                <ChatScreen
                                    currentUserId={session.user.id}
                                    onBack={() => navigate('/')}
                                    initialRoomId={null}
                                />
                            </div>
                        } />

                        {/* 🏫 /faculty (教員不在・連絡先) */}
                        <Route path="/faculty" element={<FacultyScreen />} />

                        {/* 🏫 /help (ヘルプ画面) */}
                        <Route path="/help" element={<HelpScreen />} />
                    </Routes>
                </main>
            </div>

            <ProfileEditModal
                isOpen={isProfileEditOpen}
                onClose={() => setIsProfileEditOpen(false)}
                profile={profile}
                onSave={async () => {
                    await refreshProfile();
                    setFeedVersion(v => v + 1);
                }}
            />
        </div>
    );
}