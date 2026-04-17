import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function useRoomList(currentUserId: string) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                // 1. 自分が参加しているルームIDを取得
                const { data: myParticipations } = await supabase
                    .from('room_participants')
                    .select('room_id')
                    .eq('user_id', currentUserId);

                if (!myParticipations?.length) {
                    setRooms([]);
                    return;
                }

                const roomIds = myParticipations.map(p => p.room_id);

                // 2. そのルームの「相手」の情報を取得
                const { data: others } = await supabase
                    .from('room_participants')
                    .select(`
            room_id,
            profiles:user_id (username, avatar_url)
          `)
                    .in('room_id', roomIds)
                    .neq('user_id', currentUserId);

                // 3. ルーム情報（更新日時など）を取得
                const { data: roomDetails } = await supabase
                    .from('rooms')
                    .select('*')
                    .in('id', roomIds)
                    .order('last_message_at', { ascending: false });

                if (roomDetails && others) {
                    const formattedRooms = roomDetails.map(room => {
                        const other = others.find(o => o.room_id === room.id);
                        return {
                            ...room,
                            otherProfile: other?.profiles || { username: '不明なユーザー', avatar_url: null }
                        };
                    });
                    setRooms(formattedRooms);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [currentUserId]);

    return { rooms, loading };
}