import { useState } from 'react';
import { Book, ShoppingBag, AlertCircle, Settings, Clock, Check, Calendar as CalendarIcon, Save } from 'lucide-react';
import { useOpeningHours, type FacilityType } from './useOpeningHours';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Calendar } from '../../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { cn } from '../../ui/utils';
import { toast } from 'sonner';

interface OpeningHoursWidgetProps {
    type: FacilityType;
    profile: any;
}

export function OpeningHoursWidget({ type, profile }: OpeningHoursWidgetProps) {
    const {
        isAdmin,
        loading,
        todaySchedule,
        currentMonth, setCurrentMonth,
        monthSchedules,
        saveSchedules
    } = useOpeningHours(type, profile);

    const CONFIG = type === 'library'
        ? { icon: Book, color: 'text-indigo-500 bg-indigo-50 border-indigo-100', name: '図書館' }
        : { icon: ShoppingBag, color: 'text-orange-500 bg-orange-50 border-orange-100', name: 'セコマ' };

    const Icon = CONFIG.icon;

    // --- カレンダー選択用のState ---
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    // --- 一括登録用のState ---
    const [bulkStart, setBulkStart] = useState('');
    const [bulkEnd, setBulkEnd] = useState('');
    const [targetDays, setTargetDays] = useState<number[]>([1, 2, 3, 4, 5]); // 月〜金

    // --- 共通設定フォーム ---
    const [settingForm, setSettingForm] = useState({
        open: '09:00',
        close: '18:00',
        is_closed: false
    });

    // カレンダーからの保存
    const handleCalendarSave = async () => {
        await saveSchedules(selectedDates, settingForm);
        setSelectedDates([]);
    };

    // 一括登録の実行
    const handleBulkRun = async () => {
        if (!bulkStart || !bulkEnd) return toast.error('期間を入力してね！📅');

        const startDate = new Date(bulkStart);
        const endDate = new Date(bulkEnd);

        if (startDate > endDate) return toast.error('終了日は開始日より後にしてね！🔄');

        const datesToSave: Date[] = [];

        // 日付をループして配列を作る
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (targetDays.includes(d.getDay())) {
                datesToSave.push(new Date(d));
            }
        }

        if (datesToSave.length === 0) return toast.error('対象の日付がないみたい...曜日設定を確認して！🤔');

        // 確認ダイアログっぽくToastで聞くか、そのまま実行するか。今回は実行！
        await saveSchedules(datesToSave, settingForm);
    };

    const modifiers = {
        hasSchedule: (date: Date) => {
            const d = date.toLocaleDateString('en-CA');
            return !!monthSchedules[d];
        },
        closed: (date: Date) => {
            const d = date.toLocaleDateString('en-CA');
            return monthSchedules[d]?.is_closed;
        }
    };

    // カレンダーの見た目調整
    const modifiersStyles = {
        hasSchedule: { fontWeight: 'bold', color: '#3b82f6' },
        closed: { color: '#ef4444', textDecoration: 'line-through' }
    };

    // 曜日リスト
    const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

    return (
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col justify-center h-full relative group transition-all hover:shadow-md">

            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${CONFIG.color.split(' ')[0]}`} />
                    {CONFIG.name}
                </h3>
                <div className="flex items-center gap-1">
                    {/* <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-1.5 rounded">Today</span> */}

                    {isAdmin && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded text-gray-400">
                                    <Settings className="w-3 h-3" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 overflow-hidden bg-white">
                                <div className="p-4 border-b bg-white z-10 flex items-center justify-between">
                                    <DialogTitle className="flex items-center gap-2 text-xl text-gray-800">
                                        <Icon className="w-6 h-6" />
                                        {CONFIG.name}のスケジュール管理
                                    </DialogTitle>
                                </div>

                                <Tabs defaultValue="calendar" className="flex-1 flex flex-col overflow-hidden">
                                    <div className="px-4 pt-4 bg-gray-50/50">
                                        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                                            <TabsTrigger value="calendar">📅 カレンダーで選択</TabsTrigger>
                                            <TabsTrigger value="bulk">🚀 期間で一括登録</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    {/* --- タブ1: カレンダーモード --- */}
                                    <TabsContent value="calendar" className="flex-1 flex flex-col md:flex-row overflow-hidden mt-0">
                                        {/* カレンダーエリア */}
                                        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex justify-center items-start">
                                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                                <Calendar
                                                    mode="multiple"
                                                    selected={selectedDates}
                                                    onSelect={setSelectedDates as any}
                                                    month={currentMonth}
                                                    onMonthChange={setCurrentMonth}
                                                    className="rounded-md border"
                                                    modifiers={modifiers}
                                                    modifiersStyles={modifiersStyles}
                                                    // ★ 選択時のスタイルを強力に上書き
                                                    classNames={{
                                                        day_selected: "bg-blue-600 text-white hover:bg-blue-600 focus:bg-blue-600 font-bold",
                                                        day_today: "bg-gray-100 text-gray-900 font-bold border border-gray-300"
                                                    }}
                                                />
                                                <div className="mt-4 flex gap-4 text-xs justify-center">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                                        <span>選択中</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-blue-500">12</span>
                                                        <span>営業登録済</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-red-500 line-through">12</span>
                                                        <span>休館</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 設定パネル (共通コンポーネント化したいけど、一旦ここに書く) */}
                                        <div className="w-full md:w-80 p-6 border-l bg-white flex flex-col gap-6 overflow-y-auto">
                                            <div className="space-y-2">
                                                <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    選択中の日付 ({selectedDates.length}日)
                                                </h4>
                                                {selectedDates.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded border">
                                                        {selectedDates.map((d, i) => (
                                                            <span key={i} className="text-xs bg-white border px-1.5 py-0.5 rounded text-gray-600">
                                                                {d.toLocaleDateString()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 p-4 bg-gray-50 rounded-lg text-center border border-dashed">
                                                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                        左のカレンダーから<br />日付を選んでね
                                                    </div>
                                                )}
                                            </div>

                                            <div className="h-px bg-gray-100" />

                                            {/* 設定フォーム */}
                                            <SettingForm
                                                form={settingForm}
                                                setForm={setSettingForm}
                                                onSave={handleCalendarSave}
                                                disabled={selectedDates.length === 0}
                                                saveLabel="選択した日を保存"
                                            />

                                            {selectedDates.length > 0 && (
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedDates([])}>
                                                    選択解除
                                                </Button>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* --- タブ2: 一括登録モード --- */}
                                    <TabsContent value="bulk" className="flex-1 overflow-y-auto p-6 mt-0 bg-gray-50">
                                        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-6 space-y-8">
                                            <div className="text-center space-y-2">
                                                <h3 className="text-lg font-bold text-gray-800">🚀 期間指定一括登録</h3>
                                                <p className="text-sm text-gray-500">
                                                    「4月1日から来年の3月31日まで、土日は休み」みたいな登録が一瞬でできます。<br />
                                                    すでに登録されている日付も、ここで設定した内容で上書きされます。
                                                </p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>開始日</Label>
                                                    <Input type="date" value={bulkStart} onChange={e => setBulkStart(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>終了日</Label>
                                                    <Input type="date" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label>対象の曜日</Label>
                                                <div className="flex gap-2 flex-wrap justify-center">
                                                    {WEEKDAYS.map((day, idx) => {
                                                        const isSelected = targetDays.includes(idx);
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setTargetDays(prev =>
                                                                    prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
                                                                )}
                                                                className={cn(
                                                                    "w-10 h-10 rounded-full font-bold transition-all border-2",
                                                                    isSelected
                                                                        ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-md"
                                                                        : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                                                                )}
                                                            >
                                                                {day}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="border-t pt-6">
                                                <Label className="mb-4 block">登録する内容</Label>
                                                <SettingForm
                                                    form={settingForm}
                                                    setForm={setSettingForm}
                                                    onSave={handleBulkRun}
                                                    disabled={!bulkStart || !bulkEnd || targetDays.length === 0}
                                                    saveLabel="一括登録を実行！！"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Widget表示部分 */}
            <div className="flex items-center justify-center min-h-[30px]">
                {loading ? (
                    <div className="animate-pulse bg-gray-100 w-2/3 h-6 rounded" />
                ) : !todaySchedule ? (
                    <span className="text-xs text-gray-400 font-bold">情報なし</span>
                ) : todaySchedule.is_closed ? (
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-bold">Close</span>
                    </div>
                ) : (
                    <div className={`flex items-baseline gap-1 ${CONFIG.color.split(' ')[0]}`}>
                        <span className="text-xl font-black tracking-tight">{todaySchedule.open_time.slice(0, 5)}</span>
                        <span className="text-xs font-bold opacity-60">-</span>
                        <span className="text-xl font-black tracking-tight">{todaySchedule.close_time.slice(0, 5)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// 設定フォームをコンポーネントとして分離（コードをスッキリさせるため）
function SettingForm({ form, setForm, onSave, disabled, saveLabel }: any) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => setForm({ ...form, is_closed: false })}
                    className={cn(
                        "p-3 rounded-lg border-2 text-sm font-bold transition-all flex flex-col items-center gap-1",
                        !form.is_closed
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-100 text-gray-400 hover:bg-gray-50"
                    )}
                >
                    <ShoppingBag className="w-5 h-5" />
                    営業 🏠
                </button>
                <button
                    onClick={() => setForm({ ...form, is_closed: true })}
                    className={cn(
                        "p-3 rounded-lg border-2 text-sm font-bold transition-all flex flex-col items-center gap-1",
                        form.is_closed
                            ? "border-red-500 bg-red-50 text-red-600"
                            : "border-gray-100 text-gray-400 hover:bg-gray-50"
                    )}
                >
                    <AlertCircle className="w-5 h-5" />
                    休館 🚫
                </button>
            </div>

            {!form.is_closed && (
                <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <Label className="text-xs text-gray-500">OPEN</Label>
                        <div className="relative">
                            <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                            <Input
                                type="time"
                                className="pl-9"
                                value={form.open}
                                onChange={(e) => setForm({ ...form, open: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-gray-500">CLOSE</Label>
                        <div className="relative">
                            <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                            <Input
                                type="time"
                                className="pl-9"
                                value={form.close}
                                onChange={(e) => setForm({ ...form, close: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            <Button
                onClick={onSave}
                disabled={disabled}
                className={cn(
                    "w-full h-11 font-bold mt-4",
                    form.is_closed ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                <Save className="w-4 h-4 mr-2" />
                {saveLabel}
            </Button>
        </div>
    );
}