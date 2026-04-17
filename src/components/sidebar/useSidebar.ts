import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🌟 追加！
import {
    Home, Calendar, MessageCircle, MapPin, Clock,
    Users, AlertCircle, UserX, MessageSquare
} from 'lucide-react';

interface UseSidebarProps {
    onClose: () => void;
    // 🌟 修正：もう onNavigate は使わないから消してもOK！（エラー防止のため残しておくこともできるけど、今回は消すね）
}

export function useSidebar({ onClose }: UseSidebarProps) {
    const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
    const navigate = useNavigate(); // 🌟 URLを移動する魔法！

    // メニュー項目のデータ定義
    const menuItems = [
        {
            icon: Home,
            label: 'ホーム',
            id: 'home',
            action: () => navigate('/') // 🌟 URLを / にする！
        },
        {
            icon: MessageCircle,
            label: 'メッセージ',
            id: 'chat',
            action: () => navigate('/chat') // 🌟 URLを /chat にする！
        },
        {
            icon: MessageSquare,
            label: 'みんなの投稿',
            id: 'timeline',
            action: () => navigate('/timeline') // 🌟 URLを /timeline にする！
        },
        // --- 以下はそのまま！ ---
        {
            icon: Calendar,
            label: '学年暦',
            href: '/2025_academic_calendar.pdf'
        },
        {
            icon: MapPin,
            label: '各教室利用予定',
            href: 'https://portal.do-johodai.ac.jp/class-room'
        },
        {
            icon: Users,
            label: '学生相談室',
            href: 'https://portal.do-johodai.ac.jp/reservation'
        },
        {
            icon: Clock,
            label: '休講・振替授業情報',
            href: 'https://portal.do-johodai.ac.jp/cancellation/soon'
        },
        {
            icon: AlertCircle,
            label: '講義教室変更情報',
            href: 'https://portal.do-johodai.ac.jp/change-class-room'
        },
        {
            icon: UserX,
            label: '教員不在・連絡先・オフィスアワー',
            id: 'faculty',
            href: 'https://portal.do-johodai.ac.jp/check-in'
        },
    ];

    const applicationItems = [
        { label: '時間外利用届', href: 'https://itc.do-johodai.ac.jp/online-application/overtime/' },
        { label: '大判プリンタ利用申請', href: 'https://itc.do-johodai.ac.jp/online-application/large-printer/' },
        { label: 'eduroam利用申請', href: 'https://itc.do-johodai.ac.jp/network/eduroam/#student' },
        { label: '貸与ノートPC継続利用申請', href: 'https://itc.do-johodai.ac.jp/notice/rental-pc-period-extension/' },
        { label: '証明書申請', href: 'https://www.do-johodai.ac.jp/certificate/' }
    ];

    const handleItemClick = (action?: () => void) => {
        if (action) action();
        onClose();
    };

    const navigateToHelp = () => {
        navigate('/help');
        onClose();
    };

    return {
        isApplicationsOpen,
        setIsApplicationsOpen,
        menuItems,
        applicationItems,
        handleItemClick,
        navigateToHelp,
    };
}