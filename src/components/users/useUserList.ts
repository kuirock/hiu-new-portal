import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function useUserList(isOpen: boolean, userId: string, type: 'followers' | 'following') {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let data: any[] = [];

            if (type === 'followers') {
                const { data: follows } = await supabase
                    .from('relationships') // DBテーブル名を 'relationships' に統一
                    .select('follower_id, profiles:follower_id(*)')
                    .eq('following_id', userId);

                if (follows) {
                    data = follows.map((f: any) => f.profiles);
                }
            } else {
                const { data: follows } = await supabase
                    .from('relationships')
                    .select('following_id, profiles:following_id(*)')
                    .eq('follower_id', userId);

                if (follows) {
                    data = follows.map((f: any) => f.profiles);
                }
            }
            setUsers(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return { users, loading };
}