import { createClient } from '@supabase/supabase-js';

// 環境変数（さっきの.env）から鍵を読み込むよ
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 鍵がないとエラーになっちゃうからチェック！
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SupabaseのURLとKeyが.envファイルに設定されてないよ🥺');
}

// これでどこからでもSupabaseを使えるようになるよ！
export const supabase = createClient(supabaseUrl, supabaseAnonKey);