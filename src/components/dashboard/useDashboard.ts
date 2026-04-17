import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const CHARACTER_PROFILE = {
    name: 'エディ (Edi)',
    image: '/src/Edi_stand.png',
};

export function useDashboard(session: any) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
    const [currentBgImage, setCurrentBgImage] = useState<string | null>(null);
    const [unlockedVoices, setUnlockedVoices] = useState<string[]>([]);

    const refreshProfile = useCallback(async () => {
        try {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                if (profileData.bg_image) setCurrentBgImage(profileData.bg_image);
                if (profileData.unlocked_voices) setUnlockedVoices(profileData.unlocked_voices);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }, [session.user.id]);

    useEffect(() => {
        if (session?.user?.id) {
            refreshProfile();
        }
    }, [session, refreshProfile]);

    const handleSaveProfile = async (updates: any) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session.user.id);

            if (error) throw error;

            toast.success('プロフィールを更新しました！✨');
            await refreshProfile();
            setIsProfileEditOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('保存に失敗しました💦');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // 1️⃣ 永続的な設定（最後に見た画面など）を消す
        localStorage.removeItem('dashboard_last_view');
        localStorage.removeItem('dashboard_target_user_id');

        // 2️⃣ 🌟 追加：一時的な記憶（ニュースのスクロール位置やフィルター設定など）を全消去！
        // これで「ニュースが一番上」に戻り、「タブもすべて」に戻ります✨
        sessionStorage.clear();

        // 3️⃣ 🌟 変更：ただのリロードではなく、「トップページ（/）」に強制移動させてからリロード！
        // これで次は必ずホーム画面から始まります🏠
        window.location.href = '/';
    };

    return {
        profile,
        loading,
        isSidebarOpen,
        isWidgetOpen,
        isProfileEditOpen,
        currentBgImage,
        unlockedVoices,
        setIsSidebarOpen,
        setIsWidgetOpen,
        setIsProfileEditOpen,
        handleSaveProfile,
        handleLogout,
        refreshProfile
    };
}