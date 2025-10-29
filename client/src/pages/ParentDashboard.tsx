import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, Award, Calendar, Activity, User, BarChart3 } from "lucide-react";

export default function ParentDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // 保護者の子供一覧を取得
  const { data: children, isLoading: childrenLoading } = trpc.parent.getMyChildren.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'parent',
  });

  // 最初の子供を選択(将来的には子供選択機能を追加)
  const selectedChild = children && children.length > 0 ? children[0] : null;

  // 週次データ取得
  const { data: weeklyData, isLoading: weeklyLoading } = trpc.parent.getChildWeeklyData.useQuery(
    { childId: selectedChild?.id! },
    { enabled: !!selectedChild }
  );

  // スキルデータ取得
  const { data: skillData, isLoading: skillLoading } = trpc.parent.getChildSkillData.useQuery(
    { childId: selectedChild?.id! },
    { enabled: !!selectedChild }
  );

  // 最近の活動取得
  const { data: recentActivities, isLoading: activitiesLoading } = trpc.parent.getChildRecentActivities.useQuery(
    { childId: selectedChild?.id!, limit: 10 },
    { enabled: !!selectedChild }
  );

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'parent')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || childrenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">保護者ダッシュボード</h1>
                  <p className="text-sm text-slate-500">お子様の学習状況を確認</p>
                </div>
              </div>
              <RoleSwitcher />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>お子様が登録されていません</CardTitle>
              <CardDescription>
                管理者にお問い合わせください。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* ヘッダー */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">保護者ダッシュボード</h1>
                <p className="text-sm text-slate-500">お子様: {selectedChild.displayName}</p>
              </div>
            </div>
            <RoleSwitcher />
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">現在のレベル</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">レベル {selectedChild.level}</div>
              <p className="text-sm text-slate-500 mt-1">XP: {selectedChild.xp}</p>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                  style={{ width: `${((selectedChild.xp || 0) % 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">保有コイン</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{selectedChild.coins}</div>
              <p className="text-sm text-slate-500 mt-1">ガチャやアイテム購入に使用</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">連続ログイン</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{selectedChild.loginStreak} 日</div>
              <p className="text-sm text-slate-500 mt-1">継続は力なり!</p>
            </CardContent>
          </Card>
        </div>

        {/* 週次学習データ */}
        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <CardTitle>週間学習状況</CardTitle>
            </div>
            <CardDescription>過去7日間の学習データ</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-500">読み込み中...</p>
              </div>
            ) : weeklyData && weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="problems" fill="#8b5cf6" name="問題数" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="correct" fill="#10b981" name="正解数" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-500">まだ学習データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* スキル別進捗 */}
        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <CardTitle>スキル別進捗</CardTitle>
            </div>
            <CardDescription>問題タイプ別の正答率</CardDescription>
          </CardHeader>
          <CardContent>
            {skillLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-500">読み込み中...</p>
              </div>
            ) : skillData && skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" stroke="#64748b" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
                  <Radar name="正答率" dataKey="progress" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-500">まだスキルデータがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近の活動 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <CardTitle>最近の活動</CardTitle>
            </div>
            <CardDescription>お子様の学習履歴</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="py-8 text-center">
                <p className="text-slate-500">読み込み中...</p>
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{activity.type}</p>
                      <p className="text-sm text-slate-600">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-slate-500">まだ活動履歴がありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
