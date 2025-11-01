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
import { TrendingUp, Target, Clock, Activity, User, BarChart3, Brain, CheckCircle2, MessageCircle } from "lucide-react";

export default function ParentDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // 保護者の子供一覧を取得
  const { data: children, isLoading: childrenLoading } = trpc.parent.getMyChildren.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'parent' || user?.role === 'admin'),
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
    if (!authLoading && (!isAuthenticated || (user?.role !== 'parent' && user?.role !== 'admin'))) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || childrenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-slate-900/50 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Learning Analytics</h1>
                  <p className="text-sm text-slate-400">保護者ダッシュボード</p>
                </div>
              </div>
              <RoleSwitcher />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">お子様が登録されていません</CardTitle>
              <CardDescription className="text-slate-400">
                管理者にお問い合わせください。
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // 学習効率の計算（ゼロ除算エラーを防ぐ）
  const totalProblems = weeklyData && weeklyData.length > 0
    ? weeklyData.reduce((sum, d) => sum + (d.problems || 0), 0)
    : 0;
  const totalCorrect = weeklyData && weeklyData.length > 0
    ? weeklyData.reduce((sum, d) => sum + (d.correct || 0), 0)
    : 0;
  const learningEfficiency = totalProblems > 0
    ? Math.round((totalCorrect / totalProblems) * 100)
    : 0;

  // 総学習時間の計算（秒→時間に変換）
  const totalStudySeconds = weeklyData && weeklyData.length > 0
    ? weeklyData.reduce((sum, d) => sum + (d.timeSpent || 0), 0)
    : 0;
  const totalStudyHours = Math.floor(totalStudySeconds / 3600);
  const totalStudyMinutes = Math.floor((totalStudySeconds % 3600) / 60);

  // 完了タスク数
  const completedTasks = weeklyData && weeklyData.length > 0
    ? weeklyData.reduce((sum, d) => sum + (d.correct || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-slate-900/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Learning Analytics</h1>
                <p className="text-sm text-slate-400">お子様: {selectedChild.displayName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/parent/conversations')}
                className="bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                会話履歴
              </Button>
              <RoleSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">学習効率</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{learningEfficiency}%</div>
              <p className="text-sm text-slate-500 mt-1">正答率</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">総学習時間</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {totalStudyHours > 0 ? `${totalStudyHours}h ${totalStudyMinutes}m` : `${totalStudyMinutes}m`}
              </div>
              <p className="text-sm text-slate-500 mt-1">今週の学習時間</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">完了タスク</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{completedTasks}</div>
              <p className="text-sm text-slate-500 mt-1">今週の正解数</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">継続日数</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{selectedChild.loginStreak}</div>
              <p className="text-sm text-slate-500 mt-1">連続ログイン日数</p>
            </CardContent>
          </Card>
        </div>

        {/* 週次学習データ */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-white">週間学習状況</CardTitle>
            </div>
            <CardDescription className="text-slate-400">過去7日間の学習データ</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-500">読み込み中...</p>
              </div>
            ) : weeklyData && weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)'
                    }}
                    labelStyle={{ color: '#f1f5f9' }}
                    itemStyle={{ color: '#cbd5e1' }}
                  />
                  <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                  <Bar dataKey="problems" fill="#f59e0b" name="問題数" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="correct" fill="#10b981" name="正解数" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-slate-500">データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* スキル別進捗 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-white">スキル別進捗</CardTitle>
              </div>
              <CardDescription className="text-slate-400">各分野の習熟度</CardDescription>
            </CardHeader>
            <CardContent>
              {skillLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-500">読み込み中...</p>
                </div>
              ) : skillData && skillData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="skill" stroke="#94a3b8" />
                    <PolarRadiusAxis stroke="#94a3b8" />
                    <Radar name="習熟度" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-500">データがありません</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最近の活動 */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-white">最近の活動</CardTitle>
              </div>
              <CardDescription className="text-slate-400">直近の学習履歴</CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-500">読み込み中...</p>
                </div>
              ) : recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{activity.type}</p>
                        <p className="text-xs text-slate-400">{activity.description}</p>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleDateString('ja-JP')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-500">データがありません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
