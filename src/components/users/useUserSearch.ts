import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function useUserSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`username.ilike.%${query}%,student_id.ilike.%${query}%`)
                .limit(20);

            if (error) throw error;
            setResults(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        query,
        setQuery,
        results,
        loading,
        handleSearch
    };
}