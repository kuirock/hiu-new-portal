import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  userName?: string;
  avatarUrl?: string;
  onProfileClick?: () => void; // 👈 名前をわかりやすく変えたよ！
}

export function Header({ onMenuClick, userName = 'ゲスト', avatarUrl, onProfileClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">

      {/* 左側：ハンバーガーメニューとタイトル */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          HIU Portal
        </h1>
      </div>

      {/* 右側：通知とアイコン */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-indigo-500 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* 👇 ここをクリックしたら直接プロフィールへ飛ぶように変更！ */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-full hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 group"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-indigo-200 overflow-hidden bg-indigo-50 group-hover:scale-105 transition-transform">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-indigo-400" />
            )}
          </div>

          <span className="text-sm font-bold text-gray-700 hidden md:block max-w-[100px] truncate group-hover:text-indigo-600 transition-colors">
            {userName}
          </span>
        </button>
      </div>
    </header>
  );
}