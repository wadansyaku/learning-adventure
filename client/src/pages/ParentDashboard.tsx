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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">保護者ダッシュボード</h1>
            <RoleSwitcher />
          </div>
          <Card>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">保護者ダッシュボード</h1>
            <p className="text-gray-600 mt-1">お子様: {selectedChild.displayName}</p>
          </div>
          <RoleSwitcher />
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">現在のレベル</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">レベル {selectedChild.level}</div>
              <p className="text-sm text-gray-500 mt-1">XP: {selectedChild.xp}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">保有コイン</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{selectedChild.coins} コイン</div>
              <p className="text-sm text-gray-500 mt-1">ガチャやアイテム購入に使用</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">連続ログイン</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{selectedChild.loginStreak} 日</div>
              <p className="text-sm text-gray-500 mt-1">継続は力なり!</p>
            </CardContent>
          </Card>
        </div>

        {/* 週次学習データ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>週間学習状況</CardTitle>
            <CardDescription>過去7日間の学習データ</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : weeklyData && weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="problems" fill="#8b5cf6" name="問題数" />
                  <Bar dataKey="correct" fill="#10b981" name="正解数" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">まだ学習データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* スキル別進捗 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>スキル別進捗</CardTitle>
            <CardDescription>問題タイプ別の正答率</CardDescription>
          </CardHeader>
          <CardContent>
            {skillLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : skillData && skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="正答率" dataKey="progress" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">まだスキルデータがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近の活動 */}
        <Card>
          <CardHeader>
            <CardTitle>最近の活動</CardTitle>
            <CardDescription>お子様の学習履歴</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.type}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">まだ活動履歴がありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
