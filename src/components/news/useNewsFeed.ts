import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const CATEGORIES = [
    '教務', '学生SC', '教員', '就職', '情報センター', '保健センター', '図書館', 'その他'
];

export function useNewsFeed(currentUserId: string) {
    const [posts, setPosts] = useState<any[]>([]);
    const [userActions, setUserActions] = useState<Record<string, { is_read: boolean, is_bookmarked: boolean }>>({});
    const [loading, setLoading] = useState(true);

    const [currentFilter, setCurrentFilter] = useState<string>(() => {
        return sessionStorage.getItem('news_filter') || 'all';
    });

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        sessionStorage.setItem('news_filter', currentFilter);
    }, [currentFilter]);

    useEffect(() => {
        fetchNewsAndActions();
    }, [currentUserId]);

    const fetchNewsAndActions = async () => {
        setLoading(true);
        const { data: newsData } = await supabase
            .from('news')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(100);

        const { data: actionsData } = await supabase
            .from('user_news_actions')
            .select('*')
            .eq('user_id', currentUserId);

        const actionsMap: Record<string, any> = {};
        actionsData?.forEach((action) => {
            actionsMap[action.news_url] = {
                is_read: action.is_read,
                is_bookmarked: action.is_bookmarked
            };
        });

        setPosts(newsData || []);
        setUserActions(actionsMap);
        setLoading(false);
    };

    const markAsRead = async (url: string) => {
        if (userActions[url]?.is_read) return;
        const newActions = { ...userActions, [url]: { ...userActions[url], is_read: true } };
        setUserActions(newActions);
        await supabase.from('user_news_actions').upsert({
            user_id: currentUserId,
            news_url: url,
            is_read: true,
            is_bookmarked: userActions[url]?.is_bookmarked || false
        });
    };

    const toggleBookmark = async (e: any, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        const current = userActions[url]?.is_bookmarked || false;
        const next = !current;
        const newActions = { ...userActions, [url]: { ...userActions[url], is_bookmarked: next } };
        setUserActions(newActions);
        const { error } = await supabase.from('user_news_actions').upsert({
            user_id: currentUserId,
            news_url: url,
            is_read: userActions[url]?.is_read || false,
            is_bookmarked: next
        });
        if (!error) toast.success(next ? 'ブックマークしました！🔖' : 'ブックマークを外しました');
    };

    const getBadgeStyle = (category: string) => {
        if (category.includes('教務')) return 'bg-purple-100 text-purple-700';
        if (category.includes('学生')) return 'bg-green-100 text-green-700';
        if (category.includes('教員')) return 'bg-blue-100 text-blue-700';
        if (category.includes('就職')) return 'bg-orange-100 text-orange-700';
        if (category.includes('情報')) return 'bg-cyan-100 text-cyan-700';
        if (category.includes('保健')) return 'bg-rose-100 text-rose-700';
        if (category.includes('図書館')) return 'bg-amber-100 text-amber-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getTabStyle = (category: string, isSelected: boolean) => {
        let color = 'gray';
        if (category.includes('教務')) color = 'purple';
        else if (category.includes('学生')) color = 'green';
        else if (category.includes('教員')) color = 'blue';
        else if (category.includes('就職')) color = 'orange';
        else if (category.includes('情報')) color = 'cyan';
        else if (category.includes('保健')) color = 'rose';
        else if (category.includes('図書館')) color = 'amber';

        if (isSelected) {
            return `bg-${color}-500 text-white border-${color}-500 shadow-md shadow-${color}-200 transform scale-105`;
        } else {
            return `bg-${color}-50 text-${color}-600 border-${color}-100 hover:bg-${color}-100 hover:border-${color}-200`;
        }
    };

    const checkIsImportant = (post: any) => {
        const title = post.title || '';
        const cat = post.category || '';
        return title.includes('重要') || cat.includes('重要') ||
            title.includes('奨学金') || cat.includes('奨学金') ||
            title.includes('履修') || cat.includes('履修');
    };

    const checkIsJob = (post: any) => {
        const title = post.title || '';
        return title.includes('就職');
    };

    const filteredPosts = posts.filter(post => {
        const action = userActions[post.url] || { is_read: false, is_bookmarked: false };
        const isImportant = checkIsImportant(post);
        const isJob = checkIsJob(post);

        // 🌟 修正ポイント：検索キーワードがある場合は、ここで判定してすぐ結果を返す！（タブの条件を無視する）
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const titleMatch = post.title.toLowerCase().includes(query);
            const categoryMatch = post.category.toLowerCase().includes(query);
            return titleMatch || categoryMatch; // 一致していれば true、していなければ false で終了！
        }

        // 検索キーワードがない時だけ、以下のタブの絞り込みを行う
        if (currentFilter === 'all') return true;
        if (currentFilter === 'unread') return !action.is_read;
        if (currentFilter === 'bookmark') return action.is_bookmarked;
        if (currentFilter === 'important') return isImportant;
        if (post.category && post.category.includes(currentFilter)) return true;
        if (currentFilter === '就職' && isJob) return true;

        return false;
    });

    return {
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
    };
}