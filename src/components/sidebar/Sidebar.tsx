import {
    X, LogOut,
    FileText, ChevronDown, Settings
} from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import { useSidebar } from './useSidebar';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: 'home' | 'profile' | 'chat' | 'messages' | 'faculty' | 'timeline') => void;
    onLogout: () => void;
    style?: React.CSSProperties;
    overlayStyle?: React.CSSProperties;
    currentView: string;
}

export function Sidebar(props: SidebarProps) {
    const {
        isApplicationsOpen,
        setIsApplicationsOpen,
        menuItems,
        applicationItems,
        handleItemClick,
        navigateToHelp
    } = useSidebar(props);

    const { isOpen, onClose, onLogout, style, overlayStyle, currentView } = props;

    return (
        <>
            {/* 🌟 修正：重い backdrop-blur-sm を削除し、bg-black/60 で軽くした！ */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity xl:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                style={overlayStyle}
            />

            <div
                className={`fixed top-0 left-0 h-full w-72 bg-[#1a2233] text-white z-50 transform transition-transform duration-300 ease-out xl:translate-x-0 xl:static xl:shadow-none flex flex-col xl:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={style}
            >
                <div className="p-5 flex justify-between items-center xl:hidden border-b border-white/10 shrink-0">
                    <h2 className="font-bold text-xl tracking-tight">Menu</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                    <nav className="space-y-1.5">
                        {menuItems.map((item, index) => {
                            const isActive = item.id === currentView;

                            const baseClassName = `w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-[15px] ${isActive
                                ? 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }`;

                            if (item.href) {
                                return (
                                    <a
                                        key={index}
                                        href={item.href}
                                        onClick={onClose}
                                        className={baseClassName}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                                        <span className="text-left flex-1 truncate">{item.label}</span>
                                    </a>
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleItemClick(item.action)}
                                    className={baseClassName}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                                    <span className="text-left flex-1 truncate">{item.label}</span>
                                </button>
                            );
                        })}

                        <Collapsible
                            open={isApplicationsOpen}
                            onOpenChange={setIsApplicationsOpen}
                            className="space-y-1"
                        >
                            <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-medium text-[15px] text-gray-300 hover:bg-white/10 hover:text-white group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    <span>各種申請</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isApplicationsOpen ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-1 pl-4 animate-in slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 overflow-hidden">
                                <div className="border-l border-white/10 ml-2.5 pl-2 space-y-1 my-1">
                                    {applicationItems.map((app, i) => (
                                        <button
                                            key={i}
                                            onClick={onClose}
                                            className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            {app.label}
                                        </button>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </nav>
                </div>

                <div className="p-4 border-t border-white/10 space-y-1.5 shrink-0 bg-[#1a2233]">
                    <button onClick={navigateToHelp} className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all font-medium text-[15px]">
                        <Settings className="w-5 h-5 text-gray-400" /> 使い方ガイド
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-[15px]"
                    >
                        <LogOut className="w-5 h-5" /> ログアウト
                    </button>
                </div>

            </div>
        </>
    );
}