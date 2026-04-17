import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function useAuthScreen() {
    // --- 状態管理（State） ---
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    // --- モード切替 ---
    const toggleMode = () => setIsLoginMode(prev => !prev);

    // --- 認証処理 ---
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLoginMode) {
                // ログイン処理
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('おかえりなさい！');
            } else {
                // 新規登録処理
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // プロフィール作成
                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                student_id: studentId,
                                username: username
                            }
                        ]);
                    if (profileError) throw profileError;
                }
                toast.success('登録完了！さっそく始めよう！');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        isLoginMode,
        toggleMode,
        email, setEmail,
        password, setPassword,
        studentId, setStudentId,
        username, setUsername,
        loading,
        handleAuth
    };
}