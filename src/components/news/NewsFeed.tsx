import React, { useRef, useLayoutEffect, useState, useCallback } from 'react'; // 🌟 React と useCallback を追加！
import { Bookmark, AlertTriangle, Bell, Search, X, Briefcase } from 'lucide-react';
import { useNewsFeed, CATEGORIES } from './useNewsFeed';
import './NewsFeed.css';

// 🌟🌟🌟 軽量化ポイント1：ニュース1件ずつの枠を独立させて「React.memo」で守る！ 🌟🌟🌟
const NewsItem = React.memo(function NewsItem({
    post, action, isImportant, isJob, badgeStyle, onMarkAsRead, onToggleBookmark, onArticleClick
}: any) {
    return (
        <a
            href={post.url}
            onClick={async (e) => {
                e.preventDefault();
                await onMarkAsRead(post.url);
                onArticleClick();
                window.location.href = post.url;
            }}
            className={`block relative group rounded-2xl p-4 transition-all border shrink-0 ${isImportant
                ? 'bg-red-50 border-red-100 hover:border-red-200'
                : action.is_read
                    ? 'bg-white border-gray-100 opacity-60 hover:opacity-100 hover:scale-[1.01]'
                    : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01]'
                }`}
        >
            <div className="flex justify-between items-start gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {!action.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" title="未読" />
                        )}

                        {isImportant && (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-black flex items-center gap-1 shrink-0">
                                <AlertTriangle className="w-3 h-3" /> 重要
                            </span>
                        )}

                        {isJob && post.category !== '就職' && (
                            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-600 text-[10px] font-black flex items-center gap-1 shrink-0">
                                <Briefcase className="w-3 h-3" /> 就職
                            </span>
                        )}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${badgeStyle}`}>
                            {post.category}
                        </span>

                        <span className="text-[10px] text-gray-400 font-mono">
                            {post.published_at}
                        </span>
                    </div>

                    <h3 className={`font-bold leading-snug text-sm ${isImportant ? 'text-red-900' : 'text-gray-800'}`}>
                        {post.title}
                    </h3>
                </div>

                <button
                    onClick={(e) => onToggleBookmark(e, post.url)}
                    className={`p-2 rounded-full transition-colors shrink-0 ${action.is_bookmarked
                        ? 'text-orange-500 bg-orange-50 hover:bg-orange-100'
                        : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
                        }`}
                >
                    <Bookmark className={`w-5 h-5 ${action.is_bookmarked ? 'fill-current' : ''}`} />
                </button>
            </div>
        </a>
    );
}, (prevProps, nextProps) => {
    // 🌟🌟🌟 軽量化ポイント2：比較ルール！ 🌟🌟🌟
    // 「既読・未読」か「ブックマーク」の状態が変わった時だけ描き直す！
    // 検索窓に文字を打ったりしただけでは再描画しないので爆速になる！
    return (
        prevProps.post.url === nextProps.post.url &&
        prevProps.action.is_read === nextProps.action.is_read &&
        prevProps.action.is_bookmarked === nextProps.action.is_bookmarked
    );
});


interface NewsFeedProps {
    currentUserId: string;
}

export function NewsFeed({ currentUserId }: NewsFeedProps) {
    const {
        loading,
        currentFilter,
        setCurrentFilter,
        filteredPosts,
        userActions,
        markAsRead,
        toggleBookmark,
        getBadgeStyle,
        getTabStyle,
        checkIsImportant,
        checkIsJob,
        searchQuery,
        setSearchQuery
    } = useNewsFeed(currentUserId);

    const listRef = useRef<HTMLDivElement>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useLayoutEffect(() => {
        if (!loading && listRef.current) {
            const savedPosition = sessionStorage.getItem('news_scroll_pos');
            if (savedPosition) {
                listRef.current.scrollTop = parseInt(savedPosition, 10);
            } else {
                listRef.current.scrollTop = 0;
            }
        }
    }, [loading, currentFilter]);

    // 🌟 軽量化ポイント3：関数も使い回す（useCallback）
    const handleArticleClick = useCallback(() => {
        if (listRef.current) {
            sessionStorage.setItem('news_scroll_pos', listRef.current.scrollTop.toString());
        }
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="bg-white h-20 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-160px)] min-h-[600px]">

            {/* ヘッダーエリア */}
            <div className="flex-none mb-3 flex items-center gap-2 border-b border-gray-50 pb-3 relative min-h-[40px]">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5 shrink-0">
                    <Bell className="w-4 h-4 text-indigo-500" />
                    {!isSearchOpen && "お知らせ"}
                </h2>

                {/* 検索トグルボタン */}
                <button
                    onClick={() => {
                        if (isSearchOpen) {
                            setSearchQuery('');
                        }
                        setIsSearchOpen(!isSearchOpen);
                    }}
                    className={`p-1.5 rounded-full transition-all shrink-0 ${isSearchOpen
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        : 'bg-white text-gray-400 hover:bg-indigo-50 hover:text-indigo-500'
                        }`}
                >
                    {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                </button>

                <div className="w-px h-6 bg-gray-200 shrink-0" />

                {/* 検索モードとタブモードの切り替え */}
                {isSearchOpen ? (
                    <div className="flex-1 animate-in slide-in-from-right fade-in duration-200 flex items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="キーワードで検索..."
                            autoFocus
                            className="w-full bg-gray-50 border border-gray-200 text-base rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder-gray-400"
                        />
                    </div>
                ) : (
                    <div
                        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide flex items-center gap-2 animate-in slide-in-from-left fade-in duration-200 py-1"
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        {[
                            { id: 'all', label: 'すべて' },
                            { id: 'unread', label: '未読' },
                            { id: 'important', label: '重要 🔥' },
                            { id: 'bookmark', label: '保存 🔖' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setCurrentFilter(tab.id);
                                    sessionStorage.removeItem('news_scroll_pos');
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${currentFilter === tab.id
                                    ? 'bg-gray-800 text-white border-gray-800 shadow-md transform scale-105'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}

                        <div className="w-px h-4 bg-gray-200 shrink-0 mx-1" />

                        {CATEGORIES.map((cat) => {
                            const isSelected = currentFilter === cat;
                            const className = getTabStyle(cat, isSelected);

                            return (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setCurrentFilter(cat);
                                        sessionStorage.removeItem('news_scroll_pos');
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${className}`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ニュースリスト */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 -mr-2 scroll-smooth"
            >
                {filteredPosts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <Search className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm font-bold opacity-70">
                            {searchQuery ? `"${searchQuery}" に一致する記事はありません` : '該当するお知らせはありません✨'}
                        </p>
                    </div>
                ) : (
                    filteredPosts.map((post) => {
                        const action = userActions[post.url] || { is_read: false, is_bookmarked: false };
                        const isImportant = checkIsImportant(post);
                        const isJob = checkIsJob(post);
                        const badgeStyle = getBadgeStyle(post.category);

                        // 🌟 さっき作った独立したパーツをここで使う！
                        return (
                            <NewsItem
                                key={post.url}
                                post={post}
                                action={action}
                                isImportant={isImportant}
                                isJob={isJob}
                                badgeStyle={badgeStyle}
                                onMarkAsRead={markAsRead}
                                onToggleBookmark={toggleBookmark}
                                onArticleClick={handleArticleClick}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}