import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
    Globe, Book, Video, Mail, Calendar, MapPin, Bus,
    Github, Twitter, Youtube, Code, Database, Cloud,
    Terminal, FileText, Music, Coffee, ShoppingCart,
    Smartphone, Users, GraduationCap, Briefcase, Library, Key,
    LifeBuoy, HardDrive, FolderOpen, Boxes, Stethoscope, FileSignature, Smile, Cpu
} from 'lucide-react';

export const AVAILABLE_ICONS: Record<string, any> = {
    Globe, Book, Video, Mail, Calendar, MapPin, Bus,
    Github, Twitter, Youtube, Code, Database, Cloud,
    Terminal, FileText, Music, Coffee, ShoppingCart,
    Smartphone, Users, GraduationCap, Briefcase, Library, Key,
    LifeBuoy, HardDrive, FolderOpen, Boxes, Stethoscope, FileSignature, Smile, Cpu
};

export const AVAILABLE_COLORS = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-orange-500',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-indigo-400 to-indigo-600',
    'from-gray-500 to-gray-700',
];

const DEFAULT_LINKS = [
    { title: '教務情報Webシステム', url: 'https://eduweb.do-johodai.ac.jp/', icon: 'GraduationCap', color: 'from-blue-500 to-blue-600' },
    { title: 'POLITE', url: 'https://polite.do-johodai.ac.jp/moodle/my/', icon: 'Globe', color: 'from-indigo-500 to-indigo-600' },
    { title: 'シラバス検索', url: 'https://syllabus.do-johodai.ac.jp/', icon: 'Book', color: 'from-sky-500 to-sky-600' },
    { title: 'Gmail', url: 'https://mail.google.com/', icon: 'Mail', color: 'from-purple-500 to-purple-600' },
    { title: 'Googleドライブ', url: 'https://drive.google.com/', icon: 'Cloud', color: 'from-violet-500 to-violet-600' },
    { title: 'Zドライブ', url: 'https://souryu.rmme.do-johodai.ac.jp/login', icon: 'HardDrive', color: 'from-teal-500 to-teal-600' },
    { title: '図書館', url: 'https://hiulibrary.do-johodai.ac.jp/', icon: 'Library', color: 'from-emerald-500 to-emerald-600' },
    { title: '学生相談室', url: 'https://www.do-johodai.ac.jp/students/conference/', icon: 'Users', color: 'from-cyan-500 to-cyan-600' },
    { title: '学習支援センター', url: 'https://www01.do-johodai.ac.jp/asc/', icon: 'LifeBuoy', color: 'from-green-500 to-green-600' },
    { title: '情報センター', url: 'https://itc.do-johodai.ac.jp/', icon: 'Cpu', color: 'from-teal-600 to-teal-700' },
    { title: 'HIUアカウントパスワード変更', url: 'https://portal.do-johodai.ac.jp/self-service-password/', icon: 'Key', color: 'from-fuchsia-500 to-fuchsia-600' },
    { title: 'Microsoft365', url: 'https://login.microsoftonline.com/', icon: 'Boxes', color: 'from-violet-600 to-violet-700' },
    { title: '就職希望登録', url: 'https://portal.do-johodai.ac.jp/recregi/', icon: 'Briefcase', color: 'from-orange-500 to-orange-600' },
    { title: 'i-Job（就職情報サイト）', url: 'https://portal.do-johodai.ac.jp/i-job/', icon: 'Briefcase', color: 'from-amber-500 to-amber-600' },
    { title: '公開資料', url: 'https://drive.google.com/drive/folders/1npdQjVRATGWnVl87BYY7chtnl3HPrfFh', icon: 'FolderOpen', color: 'from-slate-500 to-slate-600' },
    { title: '学生便覧', url: 'https://drive.google.com/file/d/1GmvsTWomETvFzR9EBrNb1so56QrVaxZn/view', icon: 'FileText', color: 'from-gray-500 to-gray-600' },
    { title: '証明書申請', url: 'https://www.do-johodai.ac.jp/certificate/', icon: 'FileSignature', color: 'from-red-500 to-red-600' },
    { title: '感染症に関する証明書', url: 'https://drive.google.com/drive/folders/1M5qg-l1pB_KJ3LsBQrZApTb8-I5Ag0iA', icon: 'Stethoscope', color: 'from-rose-500 to-rose-600' },
];

export interface LinkItem {
    id: string;
    title: string;
    url: string;
    icon: string;
    color: string;
    sort_order: number;
}

// 自動スクロールの設定
const SCROLL_ZONE = 100;
const MAX_SCROLL_SPEED = 15;

export function useLinkGrid(userId: string) {
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 新規追加フォーム用
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newIcon, setNewIcon] = useState('Globe');
    const [newColor, setNewColor] = useState(AVAILABLE_COLORS[0]);

    // --- ドラッグ & ドロップ用 State ---
    const [activeId, setActiveId] = useState<string | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const linksRef = useRef<LinkItem[]>([]); // 最新のlinksを保持するRef

    // スクロール制御用
    const autoScrollSpeed = useRef(0);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        fetchLinks();
    }, [userId]);

    // Refを常に最新の状態に同期
    useEffect(() => {
        linksRef.current = links;
    }, [links]);

    // 編集モード解除 (背景クリック)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (!isEditing || activeId) return;

            const target = event.target as HTMLElement;
            if (!target || !target.closest) return;

            // ドラッグ対象や追加ボタンなどは無視
            if (target.closest('[data-sort-item]')) return;
            if (target.closest('button') || target.closest('a')) return;

            setIsEditing(false);
        };

        document.addEventListener('mousedown', handleClickOutside, { capture: true });
        document.addEventListener('touchstart', handleClickOutside, { capture: true });

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, { capture: true });
            document.removeEventListener('touchstart', handleClickOutside, { capture: true });
        };
    }, [isEditing, activeId]);

    // --- 自動スクロール処理 ---
    const getScrollParent = (node: HTMLElement | null): HTMLElement | Window => {
        if (!node) return window;
        const overflowY = window.getComputedStyle(node).overflowY;
        const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
        if (isScrollable && node.scrollHeight > node.clientHeight) return node;
        return getScrollParent(node.parentElement);
    };

    const performAutoScroll = () => {
        if (autoScrollSpeed.current !== 0) {
            const scrollContainer = getScrollParent(containerRef.current);
            if (scrollContainer === window) window.scrollBy(0, autoScrollSpeed.current);
            else (scrollContainer as HTMLElement).scrollTop += autoScrollSpeed.current;
            animationFrameId.current = requestAnimationFrame(performAutoScroll);
        } else {
            animationFrameId.current = null;
        }
    };

    // --- グローバルドラッグ制御 (ここが肝！) ---
    useEffect(() => {
        if (!activeId) return;

        const handleMove = (clientX: number, clientY: number) => {
            setDragPosition({ x: clientX, y: clientY });

            // 1. 自動スクロール計算
            const windowHeight = window.innerHeight;
            if (clientY < SCROLL_ZONE) {
                autoScrollSpeed.current = -MAX_SCROLL_SPEED * ((SCROLL_ZONE - clientY) / SCROLL_ZONE);
            } else if (clientY > windowHeight - SCROLL_ZONE) {
                autoScrollSpeed.current = MAX_SCROLL_SPEED * ((clientY - (windowHeight - SCROLL_ZONE)) / SCROLL_ZONE);
            } else {
                autoScrollSpeed.current = 0;
            }

            if (autoScrollSpeed.current !== 0 && !animationFrameId.current) {
                performAutoScroll();
            }

            // 2. 並び替え判定
            const elementBelow = document.elementFromPoint(clientX, clientY);
            const sortItem = elementBelow?.closest('[data-sort-item]');

            if (sortItem) {
                const hoverIndex = Number(sortItem.getAttribute('data-index'));
                const dragIndex = linksRef.current.findIndex(l => l.id === activeId);

                if (!isNaN(hoverIndex) && dragIndex !== -1 && hoverIndex !== dragIndex) {
                    moveLink(dragIndex, hoverIndex);
                }
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault(); // スクロール阻止
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };

        const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            handleMove(e.clientX, e.clientY);
        };

        const handleEnd = () => handleDragEnd();

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleEnd);

        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
            autoScrollSpeed.current = 0;
        };
    }, [activeId]);

    const moveLink = (fromIndex: number, toIndex: number) => {
        const newLinks = [...linksRef.current];
        const [removed] = newLinks.splice(fromIndex, 1);
        newLinks.splice(toIndex, 0, removed);
        setLinks(newLinks);
        linksRef.current = newLinks;
    };

    // --- ドラッグ開始 (長押し判定付き) ---
    const handleDragStart = (e: React.TouchEvent | React.MouseEvent, id: string, _index: number) => {
        // 編集モードでない場合、長押し判定
        if (!isEditing) {
            if ('button' in e && e.button !== 0) return;
            // リンク自体をクリックしたとみなされないように、移動監視を追加
            const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const clearLongPress = () => {
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = null;
                window.removeEventListener('touchmove', onMove);
                window.removeEventListener('touchend', onEnd);
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onEnd);
                window.removeEventListener('scroll', onEnd, { capture: true });
            };

            const onMove = (ev: Event) => {
                let cX, cY;
                if ('touches' in ev) {
                    cX = (ev as TouchEvent).touches[0].clientX;
                    cY = (ev as TouchEvent).touches[0].clientY;
                } else {
                    cX = (ev as MouseEvent).clientX;
                    cY = (ev as MouseEvent).clientY;
                }
                const dist = Math.sqrt(Math.pow(cX - startX, 2) + Math.pow(cY - startY, 2));
                if (dist > 10) clearLongPress(); // 10px以上動いたらキャンセル
            };

            const onEnd = () => clearLongPress();

            timerRef.current = setTimeout(() => {
                setIsEditing(true);
                if (navigator.vibrate) navigator.vibrate(50);
                clearLongPress();
            }, 800);

            window.addEventListener('touchmove', onMove, { passive: true });
            window.addEventListener('touchend', onEnd);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('scroll', onEnd, { capture: true, passive: true });
            return;
        }

        // --- ドラッグ開始 ---
        if ((e.target as HTMLElement).closest('.delete-btn')) return; // 削除ボタンは除外
        e.preventDefault(); // 画像ドラッグなどを防止
        e.stopPropagation();

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const target = (e.target as HTMLElement).closest('[data-sort-item]');
        if (target) {
            const rect = target.getBoundingClientRect();
            setTouchOffset({ x: clientX - rect.left, y: clientY - rect.top });
        }

        // 状態リセット
        autoScrollSpeed.current = 0;
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

        setActiveId(id);
        setDragPosition({ x: clientX, y: clientY });
    };

    const handleDragEnd = async () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        autoScrollSpeed.current = 0;
        setActiveId(null);

        if (isEditing) {
            const updates = linksRef.current.map((link, index) => ({
                id: link.id,
                user_id: userId,
                title: link.title,
                url: link.url,
                icon: link.icon,
                color: link.color,
                sort_order: index
            }));
            const { error } = await supabase.from('user_links').upsert(updates);
            if (error) console.error('並び替え保存エラー', error);
        }
    };

    // --- データ取得・操作 ---
    const fetchLinks = async () => {
        try {
            const { data, error } = await supabase
                .from('user_links')
                .select('*')
                .eq('user_id', userId)
                .order('sort_order', { ascending: true });
            if (error) throw error;
            if (!data || data.length === 0) await initializeDefaultLinks();
            else setLinks(data);
        } catch (error) {
            console.error('リンク取得エラー:', error);
        }
    };

    const initializeDefaultLinks = async () => {
        const defaultData = DEFAULT_LINKS.map((link, index) => ({
            user_id: userId,
            title: link.title,
            url: link.url,
            icon: link.icon,
            color: link.color,
            sort_order: index
        }));
        const { error } = await supabase.from('user_links').insert(defaultData);
        if (!error) {
            const { data } = await supabase.from('user_links').select('*').eq('user_id', userId).order('sort_order', { ascending: true });
            setLinks(data || []);
        }
    };

    const handleAddLink = async () => {
        if (!newTitle || !newUrl) return toast.error('タイトルとURLを入力してね！');
        const newSortOrder = links.length > 0 ? links[links.length - 1].sort_order + 1 : 0;
        const { error } = await supabase.from('user_links').insert({
            user_id: userId,
            title: newTitle,
            url: newUrl,
            icon: newIcon,
            color: newColor,
            sort_order: newSortOrder
        });
        if (error) {
            toast.error('追加に失敗しました💦');
        } else {
            toast.success('アプリを追加しました！✨');
            setIsModalOpen(false);
            setNewTitle(''); setNewUrl(''); fetchLinks();
        }
    };

    const handleDeleteLink = async (id: string) => {
        const { error } = await supabase.from('user_links').delete().eq('id', id);
        if (error) toast.error('削除できませんでした💦');
        else setLinks(links.filter(l => l.id !== id));
    };

    const handleResetLinks = async () => {
        if (!confirm('本当に初期状態に戻しますか？\n追加したリンクは全て消えます。')) return;
        try {
            await supabase.from('user_links').delete().eq('user_id', userId);
            await initializeDefaultLinks();
            toast.success('初期状態に戻しました！🔄');
            setIsEditing(false);
        } catch (error) {
            toast.error('リセットに失敗しました💦');
        }
    };

    return {
        links, isEditing, setIsEditing, isModalOpen, setIsModalOpen,
        newTitle, setNewTitle, newUrl, setNewUrl, newIcon, setNewIcon, newColor, setNewColor,
        containerRef, handleAddLink, handleDeleteLink, handleResetLinks,
        // 新しいドラッグ用変数
        activeId, dragPosition, touchOffset, handleDragStart
    };
}