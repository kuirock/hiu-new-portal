export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const today = new Date();
  const hours = today.getHours();
  const minutes = today.getMinutes();

  // 3秒後に自動的に次の画面へ
  setTimeout(() => {
    onComplete();
  }, 3000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* ログイン成功メッセージ */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="text-3xl font-bold text-gray-800">ログイン成功</div>
          
          <div className="text-gray-600">
            ログイン記録を保存しました
          </div>
        </div>

        {/* ログイン時刻 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">ログイン時刻</div>
          <div className="text-4xl font-bold text-blue-600">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
          </div>
        </div>

        {/* ローディング */}
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm">読み込み中...</span>
        </div>
      </div>
    </div>
  );
}