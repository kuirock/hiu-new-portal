import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // パスは環境に合わせてね

export type FacultyMember = {
    id: string;
    name: string;
    department: string;
    email: string | null;
    status: 'present' | 'absent' | 'class' | 'remote' | string;
    location: string | null;
    office_hours: string | null;
    last_updated: string;
};

export const useFaculty = () => {
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // データを取得する関数
    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('faculty_members')
                .select('*')
                .order('department', { ascending: true }) // 学科順
                .order('name', { ascending: true });      // 名前順

            if (error) throw error;
            setFaculty(data || []);
        } catch (err: any) {
            console.error('Error fetching faculty:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 初回ロード時に取得
    useEffect(() => {
        fetchFaculty();
    }, []);

    return { faculty, loading, error, refetch: fetchFaculty };
};