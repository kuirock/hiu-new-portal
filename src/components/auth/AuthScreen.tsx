import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Toaster } from 'sonner';
import { useAuthScreen } from './useAuthScreen';
import hiuLogo from '../../img/hiu-logo.png';

export function AuthScreen() {
    // 🌟 ロジックを呼び出して使うだけ！スッキリ！
    const {
        isLoginMode, toggleMode,
        email, setEmail,
        password, setPassword,
        studentId, setStudentId,
        username, setUsername,
        loading, handleAuth
    } = useAuthScreen();

    return (
        // 🌟 背景：白ベースに近未来的なブルーのグリッド（網目）と光のぼかし！
        <div className="min-h-screen bg-[#f8fafc] relative flex items-center justify-center p-4 overflow-hidden">

            {/* 近未来的な背景エフェクト（動く光のオーブとサイバーグリッド） */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-300/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* メインカード（グラスモーフィズム：すりガラス風） */}
            <div className="relative bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(59,130,246,0.15)] p-8 sm:p-10 rounded-[2.5rem] w-full max-w-md animate-in zoom-in duration-500">

                <div className="text-center mb-8">
                    {/* アイコン部分もSFチックに発光させる！ */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(59,130,246,0.2)] border border-blue-100 transform rotate-3 transition-transform hover:rotate-0">
                        {isLoginMode ? (
                            <img
                                src={hiuLogo}
                                alt="北海道情報大学ロゴ"
                                className="w-12 h-12 object-contain"
                            />
                        ) : (
                            <img
                                src={hiuLogo}
                                alt="北海道情報大学ロゴ"
                                className="w-12 h-12 object-contain"
                            />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 tracking-tight">
                        {isLoginMode ? 'SYSTEM LOGIN' : 'CREATE ACCOUNT'}
                    </h1>
                    <p className="text-blue-900/60 text-sm mt-2 font-medium">
                        {isLoginMode ? 'ν-Portal へようこそ' : '新しいアクセス権限を取得します'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* 新規登録の時だけ表示する項目 */}
                    {!isLoginMode && (
                        <>
                            <div className="space-y-1.5 group">
                                <label className="text-xs font-bold text-blue-900/60 ml-1 uppercase tracking-wider">Student ID</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/50 backdrop-blur-sm border border-blue-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 shadow-inner"
                                    placeholder="b123456"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5 group">
                                <label className="text-xs font-bold text-blue-900/60 ml-1 uppercase tracking-wider">Nickname</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/50 backdrop-blur-sm border border-blue-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 shadow-inner"
                                    placeholder="エディ"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* 共通項目 */}
                    <div className="space-y-1.5 group">
                        <label className="text-xs font-bold text-blue-900/60 ml-1 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/50 backdrop-blur-sm border border-blue-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 shadow-inner"
                            placeholder="test@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5 group">
                        <label className="text-xs font-bold text-blue-900/60 ml-1 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/50 backdrop-blur-sm border border-blue-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 shadow-inner"
                            placeholder="6文字以上で入力"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            // 🌟 ボタンもブルーのグラデーションと光るシャドウで近未来的に！
                            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {/* ホバーした時にキラッと光るエフェクト */}
                            <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500 ease-in-out"></div>

                            <span className="relative z-10 flex items-center gap-2 tracking-wider">
                                {loading ? '認証中...' : isLoginMode ? 'LOGIN' : 'REGISTER'}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={toggleMode}
                        className="text-sm text-blue-600 font-bold hover:text-cyan-500 flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                        {isLoginMode ? (
                            <>アカウントをお持ちでない方 <UserPlus className="w-4 h-4 ml-1" /></>
                        ) : (
                            <>すでにアカウントをお持ちの方 <LogIn className="w-4 h-4 ml-1" /></>
                        )}
                    </button>
                </div>
            </div>

            <Toaster position="top-center" richColors />
        </div>
    );
}