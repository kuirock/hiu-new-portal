import { useState, useMemo } from 'react';
import { useFaculty } from './useFaculty';
import { Search, MapPin, Clock, Mail, RefreshCw, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const FacultyScreen = () => {
    const { faculty, loading, refetch } = useFaculty();
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');

    // 学科の一覧を自動で作る
    const departments = useMemo(() => {
        const deps = new Set(faculty.map((f) => f.department));
        return ['all', ...Array.from(deps)];
    }, [faculty]);

    // 検索とフィルターのロジック
    const filteredFaculty = useMemo(() => {
        return faculty.filter((teacher) => {
            const matchName = teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchDept = departmentFilter === 'all' || teacher.department === departmentFilter;
            return matchName && matchDept;
        });
    }, [faculty, searchTerm, departmentFilter]);

    // ステータスごとの色分け
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-500 text-white hover:bg-green-600'; // 在室
            case 'class': return 'bg-yellow-500 text-white hover:bg-yellow-600'; // 授業中
            case 'remote': return 'bg-blue-500 text-white hover:bg-blue-600';    // リモート
            default: return 'bg-gray-200 text-gray-700 hover:bg-gray-300';       // 不在/不明
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'present': return '在室';
            case 'class': return '授業中';
            case 'remote': return 'リモート';
            case 'absent': return '不在';
            default: return status;
        }
    };

    return (
        <div className="p-4 max-w-5xl mx-auto pb-24">
            {/* ヘッダー部分 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        👨‍🏫 教員在不在状況
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        今の時間はスクレイピングで自動更新されるよ！
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    更新
                </Button>
            </div>

            {/* 検索・フィルターエリア */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="先生の名前で検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <SelectValue placeholder="学科で絞り込み" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全学科</SelectItem>
                        {departments.map((dept) => (
                            dept !== 'all' && <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* リスト表示エリア */}
            {loading && faculty.length === 0 ? (
                <div className="text-center py-12 text-gray-500">読み込み中...</div>
            ) : filteredFaculty.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    該当する先生が見つかりませんでした💦
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFaculty.map((teacher) => (
                        <Card key={teacher.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
                                <div>
                                    <Badge variant="secondary" className="mb-2 text-xs">
                                        {teacher.department}
                                    </Badge>
                                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                                </div>
                                <Badge className={`${getStatusColor(teacher.status)} border-none`}>
                                    {getStatusLabel(teacher.status)}
                                </Badge>
                            </CardHeader>

                            <CardContent className="space-y-3 text-sm pt-2">
                                {teacher.location && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>{teacher.location}</span>
                                    </div>
                                )}

                                {teacher.office_hours && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{teacher.office_hours}</span>
                                    </div>
                                )}

                                {teacher.email && (
                                    <div className="flex items-center gap-2 text-gray-600 overflow-hidden">
                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{teacher.email}</span>
                                    </div>
                                )}

                                <div className="pt-2 border-t mt-2 text-xs text-gray-400 text-right">
                                    更新: {new Date(teacher.last_updated).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};