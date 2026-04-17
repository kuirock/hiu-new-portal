import { Calendar, LayoutGrid } from 'lucide-react';
import { TimetableEditor } from './TimetableEditor';
import { useScheduleWidget, COLORS, BAR_COLORS } from './useScheduleWidget';

interface ScheduleWidgetProps {
    currentUserId: string;
}

export function ScheduleWidget({ currentUserId }: ScheduleWidgetProps) {
    const {
        schedule,
        isEditorOpen,
        setIsEditorOpen,
        fetchTodaySchedule
    } = useScheduleWidget(currentUserId);

    return (
        <div className="relative group">
            {/* ★ 右上に配置: 時間割を確認ボタン */}
            <button
                onClick={() => setIsEditorOpen(true)}
                className="absolute top-4 right-4 text-xs font-bold text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 z-10"
            >
                <LayoutGrid className="w-3.5 h-3.5" />
                時間割を確認
            </button>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        今日の授業
                    </h3>
                </div>

                <div className="space-y-2 pt-2">
                    {schedule.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-100 rounded-xl">
                            今日の授業はありません🎉
                        </div>
                    ) : (
                        schedule.map((item) => {
                            const colorKey = item.color || 'blue';
                            const theme = COLORS[colorKey] || COLORS.blue;
                            const bar = BAR_COLORS[colorKey] || BAR_COLORS.blue;

                            return (
                                <div key={item.id} className={`flex items-center gap-3 p-2 rounded-xl border relative overflow-hidden ${theme.split(' ')[0]} ${theme.split(' ')[1]}`}>
                                    <div className={`absolute left-0 top-0 w-1 h-full ${bar}`} />

                                    <div className="flex flex-col items-center justify-center w-10 h-10 bg-white/80 rounded-lg shadow-sm shrink-0 backdrop-blur-sm">
                                        <span className="text-[9px] font-bold text-gray-400">{item.period}限</span>
                                        <span className="text-xs font-black text-gray-800">{item.start_time?.slice(0, 5) || ''}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-xs truncate">{item.subject}</h4>
                                        <p className="text-[10px] text-gray-500 truncate">
                                            {item.room && `📍 ${item.room}`} {item.teacher && `/ ${item.teacher}`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <TimetableEditor
                userId={currentUserId}
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    fetchTodaySchedule();
                }}
            />
        </div>
    );
}