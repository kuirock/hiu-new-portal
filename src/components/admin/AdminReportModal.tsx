import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { ShieldAlert, Trash2, CheckCircle, Megaphone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export function AdminReportModal() {
    const [groupedReports, setGroupedReports] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        // 🌟 修正：posts から「is_announcement（告知かどうか）」と「title（告知のタイトル）」も持ってくる！
        const { data, error } = await supabase
            .from('reports')
            .select(`
                id,
                reason,
                status,
                created_at,
                posts ( id, content, media_url, user_id, is_announcement, title ),
                profiles ( username )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (!error && data) {
            // 🌟 修正：同じ投稿(post)に対する通報を1つにまとめる処理！
            const grouped = data.reduce((acc, current) => {
                // Supabaseは関連データを配列として返すため、最初の要素を取得
                const post = Array.isArray(current.posts) ? current.posts[0] : current.posts;
                if (!post) return acc; // 投稿が既に消えている場合は無視

                // 初めて見る投稿なら、箱を作る
                if (!acc[post.id]) {
                    acc[post.id] = {
                        post: post,
                        reports: [] // 通報履歴を入れるリスト
                    };
                }

                // Supabaseは関連データを配列として返すため、最初の要素を取得
                const profile = Array.isArray(current.profiles) ? current.profiles[0] : current.profiles;

                // 箱の中に通報内容を追加
                acc[post.id].reports.push({
                    id: current.id,
                    reason: current.reason,
                    reporter: profile?.username || '風吹けば名無し',
                    created_at: current.created_at
                });

                return acc;
            }, {} as Record<string, any>);

            // まとめたデータをセットする
            setGroupedReports(Object.values(grouped));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) fetchReports();
    }, [isOpen]);

    const handleDeletePost = async (postId: string) => {
        if (!confirm('この投稿を本当に削除しますか？\n（関連する通報履歴もすべて消えます）')) return;

        const { error } = await supabase.from('posts').delete().eq('id', postId);

        if (error) {
            console.error("🔥削除エラー:", error);
            toast.error('削除に失敗しました💦');
        } else {
            toast.success('不適切な投稿を削除しました🗑️');
            setGroupedReports(prev => prev.filter(group => group.post.id !== postId));
        }
    };

    // 🌟 修正：複数の通報をまとめて「問題なし（削除）」にする！
    const handleDismissReports = async (reportIds: string[], postId: string) => {
        if (!confirm('これらの通報を「問題なし」として処理しますか？')) return;

        const { error } = await supabase
            .from('reports')
            .delete()
            .in('id', reportIds); // in() を使うと、リストに入っているIDをまとめて消せる！

        if (error) {
            console.error("🔥問題なし処理エラー:", error);
            toast.error('エラーが発生しました💦');
        } else {
            toast.success('通報を「問題なし」として処理しました✅');
            setGroupedReports(prev => prev.filter(group => group.post.id !== postId));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 relative">
                    <ShieldAlert className="w-7 h-7" />
                    {/* 🌟 おまけ：未対応の通報がある時に通知バッジをつける！ */}
                    {groupedReports.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-red-900 border-2 border-white shadow-sm">
                            {groupedReports.length}
                        </span>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl bg-white max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="shrink-0 border-b p-6 pb-4 bg-red-50/50">
                    <DialogTitle className="flex items-center gap-2 text-red-600 text-xl">
                        <ShieldAlert className="w-6 h-6" />
                        通報管理ダッシュボード
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/50">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">読み込み中...</p>
                    ) : groupedReports.length === 0 ? (
                        <div className="text-center py-16">
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
                            <p className="text-gray-500 font-bold text-lg">未対応の通報はありません✨</p>
                            <p className="text-sm text-gray-400 mt-2">平和なコミュニティが保たれています！</p>
                        </div>
                    ) : (
                        groupedReports.map((group) => {
                            const { post, reports } = group;
                            const reportIds = reports.map((r: any) => r.id); // まとめて消すためのIDリスト
                            const isAnnouncement = post.is_announcement;

                            return (
                                <div key={post.id} className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden">
                                    {/* 🌟 1. ヘッダー部分（告知か一般投稿かと、通報件数） */}
                                    <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {isAnnouncement ? (
                                                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                    <Megaphone className="w-3.5 h-3.5" /> 告知
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                    <MessageSquare className="w-3.5 h-3.5" /> 一般投稿
                                                </span>
                                            )}
                                            <span className="text-sm font-bold text-red-600">
                                                通報 {reports.length} 件
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs text-gray-600 hover:bg-gray-100 border-gray-200"
                                                onClick={() => handleDismissReports(reportIds, post.id)}
                                            >
                                                問題なし
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                                                onClick={() => handleDeletePost(post.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                投稿を削除
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 🌟 2. 投稿内容（告知ならタイトルも出す！） */}
                                    <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                        <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-2">対象の投稿内容</p>
                                        {isAnnouncement && post.title && (
                                            <h4 className="font-bold text-gray-800 mb-1">{post.title}</h4>
                                        )}
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                                        {post.media_url && (
                                            <img src={post.media_url} alt="通報された画像" className="mt-3 rounded-lg max-h-40 object-cover border border-gray-200" />
                                        )}
                                    </div>

                                    {/* 🌟 3. その投稿に対する通報のリスト（誰がどういう理由で通報したか） */}
                                    <div className="p-4">
                                        <p className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-3">通報の詳細</p>
                                        <div className="space-y-3">
                                            {reports.map((report: any) => (
                                                <div key={report.id} className="flex flex-col gap-1 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded mt-0.5 whitespace-nowrap">
                                                            {report.reason}
                                                        </span>
                                                        <span className="text-gray-600 flex-1 leading-snug">
                                                            {report.reporter} <span className="text-gray-400 text-xs ml-1">({format(new Date(report.created_at), 'MM/dd HH:mm', { locale: ja })})</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}