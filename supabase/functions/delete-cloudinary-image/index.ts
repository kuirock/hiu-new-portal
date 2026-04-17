// import { serve } ... はもう要らないよ！ゴミ箱ポイ🗑️
import { v2 as cloudinary } from "cloudinary"

// 環境変数の読み込み（書き方はそのままでOK）
cloudinary.config({
    cloud_name: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
    api_key: Deno.env.get('CLOUDINARY_API_KEY'),
    api_secret: Deno.env.get('CLOUDINARY_API_SECRET')
});

// serveの代わりに "Deno.serve" を使うのが今のトレンド✨
Deno.serve(async (req) => {
    // CORS設定（ブラウザからのアクセス許可）
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        // データを受け取る
        const { public_id, resource_type } = await req.json()

        if (!public_id) throw new Error('public_id is required')

        // 削除実行！
        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: resource_type || 'image'
        });

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
    }
})