import React, { Suspense } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useWidgetArea } from './useWidgetArea';
import './WidgetArea.css';
import { Portal } from '../../ui/Portal';

const BusSchedule = React.lazy(() => import('../bus/BusSchedule').then(m => ({ default: m.BusSchedule })));
const ScheduleWidget = React.lazy(() => import('../schedule/ScheduleWidget').then(m => ({ default: m.ScheduleWidget })));
const OpeningHoursWidget = React.lazy(() => import('../opening-hours/OpeningHoursWidget').then(m => ({ default: m.OpeningHoursWidget })));
const ClockWidget = React.lazy(() => import('../clock/ClockWidget').then(m => ({ default: m.ClockWidget })));
const WeatherWidget = React.lazy(() => import('../weather/WeatherWidget').then(m => ({ default: m.WeatherWidget })));
const CafeteriaWidget = React.lazy(() => import('../cafeteria/CafeteriaWidget').then(m => ({ default: m.CafeteriaWidget })));
const EdhiMascotWidget = React.lazy(() => import('../edhi-mascot/EdhiMascotWidget').then(m => ({ default: m.EdhiMascotWidget })));

const WidgetSkeleton = () => <div className="w-full h-32 bg-gray-200/50 rounded-2xl animate-pulse" />;

const WIDGET_REGISTRY: Record<string, any> = {
    clock: { component: ClockWidget, label: '時計' },
    weather: { component: WeatherWidget, label: '天気・気温' },
    bus: { component: BusSchedule, label: 'バス時刻表' },
    schedule: { component: ScheduleWidget, label: '今日の予定' },
    cafeteria: { component: CafeteriaWidget, label: '今日のランチメニュー' },
    library: { component: (props: any) => <OpeningHoursWidget type="library" {...props} />, label: '図書館 開館時間' },
    seicomart: { component: (props: any) => <OpeningHoursWidget type="seicomart" {...props} />, label: 'セイコーマート' },
    mascot: { component: EdhiMascotWidget, label: 'eDhiちゃんと遊ぶ' },
};

interface WidgetAreaProps {
    userId: string;
    profile: any;
}

export function WidgetArea({ userId, profile }: WidgetAreaProps) {
    const {
        widgets, isEditing, setIsEditing: _, isModalOpen, setIsModalOpen,
        containerRef, handleDelete, openModal, selectedTypes, toggleSelection, handleAddSelected,
        activeId, dragPosition, touchOffset, handleDragStart
    } = useWidgetArea(userId);

    const activeWidget = widgets.find(w => w.id === activeId);

    const renderWidgetContent = (widget: any) => {
        const WidgetComponent = WIDGET_REGISTRY[widget.widget_type]?.component;
        if (!WidgetComponent) return null;

        return (
            <Suspense fallback={<WidgetSkeleton />}>
                <WidgetComponent currentUserId={userId} profile={profile} />
            </Suspense>
        );
    };

    return (
        // 🌟 修正：余計な max-w や mx-auto を削除！親の div (280px) にピッタリ収まるように w-full だけにする！
        <div className="space-y-4 pb-32 w-full" ref={containerRef}>
            <div className="space-y-4 relative">
                {widgets.map((widget, index) => (
                    <div
                        key={widget.id}
                        data-sort-item
                        data-index={index}
                        onTouchStart={(e) => handleDragStart(e, widget.id, index)}
                        onMouseDown={(e) => handleDragStart(e, widget.id, index)}

                        className={`relative transition-all duration-200 rounded-xl
                            ${isEditing ? 'cursor-move widget-mode-editing' : 'widget-safe-touch'}
                            ${activeId === widget.id ? 'opacity-0' : ''} 
                            ${isEditing && activeId !== widget.id ? 'animate-shake' : ''}
                        `}
                    >
                        {isEditing && (
                            <div className="absolute -top-3 -right-3 z-20 animate-in zoom-in duration-200">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(widget.id); }}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="bg-gray-400 text-white p-2 rounded-full shadow-md hover:bg-red-500 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className={isEditing ? 'widget-content-locked' : ''}>
                            {renderWidgetContent(widget)}
                        </div>
                    </div>
                ))}

                <button
                    onClick={openModal}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50 transition-all gap-2 group"
                >
                    <div className="p-1.5 bg-gray-100 rounded-full group-hover:bg-white transition-colors"><Plus className="w-4 h-4" /></div>
                    <span className="font-bold text-xs">ウィジェットを追加</span>
                </button>
            </div>

            {activeId && activeWidget && (
                <Portal>
                    <div
                        className="fixed z-[9999] pointer-events-none widget-mode-editing"
                        style={{
                            left: 0, top: 0,
                            // 🌟 ドラッグ中も固定幅(280px)で見えるように調整！
                            width: '280px',
                            transform: `translate(${dragPosition.x - touchOffset.x}px, ${dragPosition.y - touchOffset.y}px) scale(1.03)`,
                        }}
                    >
                        <div className="shadow-2xl opacity-90 rounded-xl overflow-hidden ring-4 ring-indigo-400/50 bg-white rotate-2">
                            {renderWidgetContent(activeWidget)}
                        </div>
                    </div>
                </Portal>
            )}

            {isModalOpen && (
                <Portal>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                        <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
                        <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative z-10 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h3 className="font-bold text-gray-800">ウィジェットを追加</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3 overflow-y-auto px-1 py-1 custom-scrollbar">
                                {Object.keys(WIDGET_REGISTRY).map(key => {
                                    const info = WIDGET_REGISTRY[key];
                                    const isAdded = widgets.some(w => w.widget_type === key);
                                    const isSelected = selectedTypes.includes(key);
                                    return (
                                        <button key={key} onClick={() => !isAdded && toggleSelection(key)} disabled={isAdded} className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all border-2 group ${isAdded ? 'bg-gray-50 text-gray-400 border-transparent cursor-default' : isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-200 hover:shadow-sm'}`}>
                                            <span className="font-bold text-sm">{info.label}</span>
                                            {isAdded ? <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded-full">追加済み</span> : isSelected ? <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-md animate-in zoom-in"><Check className="w-3.5 h-3.5 text-white" /></div> : <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-indigo-300 transition-colors" />}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 shrink-0">
                                <button onClick={handleAddSelected} disabled={selectedTypes.length === 0} className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${selectedTypes.length > 0 ? 'bg-gray-900 hover:bg-black shadow-lg hover:shadow-xl translate-y-0 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}><Plus className="w-4 h-4" /><span>追加する {selectedTypes.length > 0 && `(${selectedTypes.length})`}</span></button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}