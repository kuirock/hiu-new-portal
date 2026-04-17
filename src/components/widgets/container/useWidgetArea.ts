import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

const DEFAULT_WIDGETS = ['bus', 'schedule', 'cafeteria', 'library'];

// 自動スクロールの設定
const SCROLL_ZONE = 100;
const MAX_SCROLL_SPEED = 15;

export function useWidgetArea(userId: string) {
    const [widgets, setWidgets] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const widgetsRef = useRef<any[]>([]);

    // スクロール制御用
    const autoScrollSpeed = useRef(0);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => { fetchWidgets(); }, [userId]);
    useEffect(() => { widgetsRef.current = widgets; }, [widgets]);

    // 編集モード解除（背景タップ）
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (!isEditing || activeId) return;
            const target = event.target as HTMLElement;
            if (!target || !target.closest) return;
            if (target.closest('[data-sort-item]')) return;
            if (target.closest('button') || target.closest('a')) return;
            setIsEditing(false);
        };
        document.addEventListener('touchstart', handleClickOutside, { capture: true });
        document.addEventListener('mousedown', handleClickOutside, { capture: true });
        return () => {
            document.removeEventListener('touchstart', handleClickOutside, { capture: true });
            document.removeEventListener('mousedown', handleClickOutside, { capture: true });
        };
    }, [isEditing, activeId]);

    // 自動スクロール実行ループ
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

    // グローバルドラッグ制御
    useEffect(() => {
        if (!activeId) return;

        const handleMove = (clientX: number, clientY: number) => {
            setDragPosition({ x: clientX, y: clientY });

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

            const elementBelow = document.elementFromPoint(clientX, clientY);
            const sortItem = elementBelow?.closest('[data-sort-item]');
            if (sortItem) {
                const hoverIndex = Number(sortItem.getAttribute('data-index'));
                const dragIndex = widgetsRef.current.findIndex(w => w.id === activeId);
                if (!isNaN(hoverIndex) && dragIndex !== -1 && hoverIndex !== dragIndex) {
                    moveWidget(dragIndex, hoverIndex);
                }
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };
        const handleMouseMove = (e: MouseEvent) => { e.preventDefault(); handleMove(e.clientX, e.clientY); };

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

    const moveWidget = (fromIndex: number, toIndex: number) => {
        const newWidgets = [...widgetsRef.current];
        const [removed] = newWidgets.splice(fromIndex, 1);
        newWidgets.splice(toIndex, 0, removed);
        setWidgets(newWidgets);
        widgetsRef.current = newWidgets;
    };

    const handleDragStart = (e: React.TouchEvent | React.MouseEvent, id: string, _index: number) => {
        if (!isEditing) {
            if ('button' in e && e.button !== 0) return;
            if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;

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
                let clientX, clientY;
                if ('touches' in ev) {
                    clientX = (ev as TouchEvent).touches[0].clientX;
                    clientY = (ev as TouchEvent).touches[0].clientY;
                } else {
                    clientX = (ev as MouseEvent).clientX;
                    clientY = (ev as MouseEvent).clientY;
                }
                const dist = Math.sqrt(Math.pow(clientX - startX, 2) + Math.pow(clientY - startY, 2));
                if (dist > 10) clearLongPress();
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

        if ((e.target as HTMLElement).closest('button')) return;
        e.stopPropagation();

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const target = (e.target as HTMLElement).closest('[data-sort-item]');
        if (target) {
            const rect = target.getBoundingClientRect();
            setTouchOffset({ x: clientX - rect.left, y: clientY - rect.top });
        }

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
            const updates = widgetsRef.current.map((w, i) => ({
                id: w.id, user_id: userId, widget_type: w.widget_type, sort_order: i
            }));
            await supabase.from('user_widgets').upsert(updates);
        }
    };

    // --- その他 ---
    const fetchWidgets = async () => {
        const { data } = await supabase.from('user_widgets').select('*').eq('user_id', userId).order('sort_order', { ascending: true });
        if (!data || data.length === 0) await initializeWidgets();
        else setWidgets(data.filter((w, i, s) => i === s.findIndex(t => t.widget_type === w.widget_type)));
    };
    const initializeWidgets = async () => {
        const initData = DEFAULT_WIDGETS.map((type, i) => ({ user_id: userId, widget_type: type, sort_order: i }));
        await supabase.from('user_widgets').insert(initData);
        fetchWidgets();
    };
    const openModal = () => { setSelectedTypes([]); setIsModalOpen(true); };
    const toggleSelection = (type: string) => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    const handleAddSelected = async () => {
        if (selectedTypes.length === 0) return;
        const maxSort = widgets.length > 0 ? Math.max(...widgets.map(w => w.sort_order)) : -1;
        const newW = selectedTypes.map((t, i) => ({ user_id: userId, widget_type: t, sort_order: maxSort + 1 + i }));
        const { error } = await supabase.from('user_widgets').insert(newW);
        if (!error) { toast.success(`${selectedTypes.length}個追加しました✨`); fetchWidgets(); setIsModalOpen(false); setSelectedTypes([]); }
    };

    // 🗑️ 【修正】サクサク削除（楽観的UI）
    const handleDelete = async (id: string) => {
        // confirmを削除して、即座にUIを更新！
        const originalWidgets = [...widgets];
        setWidgets(prev => prev.filter(w => w.id !== id));

        try {
            // 裏で削除処理
            const { error } = await supabase.from('user_widgets').delete().eq('id', id);
            if (error) throw error;
            toast.success('削除しました🗑️');
        } catch (error) {
            console.error(error);
            toast.error('削除できませんでした💦');
            setWidgets(originalWidgets); // 失敗したら元に戻す
        }
    };

    return {
        widgets, isEditing, setIsEditing, isModalOpen, setIsModalOpen,
        containerRef, handleDelete, openModal, selectedTypes, toggleSelection, handleAddSelected,
        activeId, dragPosition, touchOffset, handleDragStart
    };
}