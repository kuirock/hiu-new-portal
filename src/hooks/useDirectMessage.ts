import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useDirectMessage(currentUserId: string) {
    const [loading, setLoading] = useState(false);

    // 相手のIDを受け取って、部屋IDを返す（なければ作って返す）
    const getOrCreateRoom = async (targetUserId: string): Promise<string | null> => {
        setLoading(true);
        try {
            // 1. まず、自分と相手が両方入っている部屋がないか探す
            // （Supabaseのクエリでやると複雑なので、RPCを使うのが最良だけど、
            //   一旦クライアントサイドでやる簡易版でいくね！）

            // 自分の入ってる部屋一覧を取得
            const { data: myRooms } = await supabase
                .from('room_participants')
                .select('room_id')
                .eq('user_id', currentUserId);

            if (myRooms && myRooms.length > 0) {
                const myRoomIds = myRooms.map(r => r.room_id);

                // その部屋の中に、相手も入ってる部屋があるか探す
                const { data: commonRooms } = await supabase
                    .from('room_participants')
                    .select('room_id')
                    .eq('user_id', targetUserId)
                    .in('room_id', myRoomIds)
                    .limit(1);

                // あったらその部屋IDを返す
                if (commonRooms && commonRooms.length > 0) {
                    return commonRooms[0].room_id;
                }
            }

            // 2. なければ、新しい部屋を作る！
            const { data: newRoom, error: roomError } = await supabase
                .from('rooms')
                .insert({}) // 空っぽで作成
                .select()
                .single();

            if (roomError) throw roomError;

            // 3. 自分と相手をその部屋に参加させる
            const { error: partError } = await supabase
                .from('room_participants')
                .insert([
                    { room_id: newRoom.id, user_id: currentUserId },
                    { room_id: newRoom.id, user_id: targetUserId }
                ]);

            if (partError) throw partError;

            return newRoom.id;

        } catch (error) {
            console.error('DM開始エラー:', error);
            toast.error('チャットを開始できませんでした💦');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { getOrCreateRoom, loading };
}