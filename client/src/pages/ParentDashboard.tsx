import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export default function ParentDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // 保護者画面はデモモード（親子関係テーブルが未実装のため）
  const profile = {
    id: 1,
    userId: user?.id || 0,
    displayName: "さくら",
    avatarIcon: null,
    level: 5,
    xp: 450,
    coins: 120,
    currentCharacterId: null,
    loginStreak: 7,
    lastLoginDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'parent')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 週次学習データ(ダミーデータ - 実際はAPIから取得)
  const weeklyData = [
    { day: '月', 学習時間: 15, 問題数: 8, 正答率: 87 },
    { day: '火', 学習時間: 20, 問題数: 12, 正答率: 92 },
    { day: '水', 学習時間: 10, 問題数: 5, 正答率: 80 },
    { day: '木', 学習時間: 25, 問題数: 15, 正答率: 95 },
    { day: '金', 学習時間: 18, 問題数: 10, 正答率: 90 },
    { day: '土', 学習時間: 30, 問題数: 18, 正答率: 88 },
    { day: '日', 学習時間: 22, 問題数: 13, 正答率: 91 },
  ];

  // スキル別進捗データ
  const skillData = [
    { name: '足し算', value: 85, color: '#3b82f6' },
    { name: '引き算', value: 78, color: '#10b981' },
    { name: '比較', value: 92, color: '#f59e0b' },
    { name: '図形', value: 70, color: '#8b5cf6' },
  ];

  // 最近の活動
  const recentActivities = [
    { date: '2025-01-29 14:30', activity: '足し算問題10問クリア', result: '正答率: 90%' },
    { date: '2025-01-29 10:15', activity: 'ストーリー第3章完了', result: 'XP +50獲得' },
    { date: '2025-01-28 16:20', activity: '引き算問題15問クリア', result: '正答率: 87%' },
    { date: '2025-01-28 11:00', activity: 'ログインボーナス獲得', result: 'コイン +20' },
    { date: '2025-01-27 15:45', activity: 'ガチャでレアアイテム獲得', result: '虹色の帽子' },
  ];

  const totalStudyTime = weeklyData.reduce((sum, day) => sum + day.学習時間, 0);
  const totalProblems = weeklyData.reduce((sum, day) => sum + day.問題数, 0);
  const avgAccuracy = Math.round(weeklyData.reduce((sum, day) => sum + day.正答率, 0) / weeklyData.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">保護者ダッシュボード</h1>
              <p className="text-sm text-gray-600 mt-1">お子様の学習状況を確認できます</p>
            </div>
            <div className="flex items-center gap-4">
              <RoleSwitcher />
              <Button variant="outline" onClick={() => setLocation('/')}>
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>現在のレベル</CardDescription>
              <CardTitle className="text-3xl">{profile.level}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                次のレベルまで: {100 - (profile.xp % 100)} XP
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>今週の学習時間</CardDescription>
              <CardTitle className="text-3xl">{totalStudyTime}分</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                1日平均: {Math.round(totalStudyTime / 7)}分
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>今週の問題数</CardDescription>
              <CardTitle className="text-3xl">{totalProblems}問</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                1日平均: {Math.round(totalProblems / 7)}問
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>平均正答率</CardDescription>
              <CardTitle className="text-3xl">{avgAccuracy}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {avgAccuracy >= 90 ? '優秀です' : avgAccuracy >= 80 ? '良好です' : '要復習'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* グラフセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 週次学習時間 */}
          <Card>
            <CardHeader>
              <CardTitle>週次学習時間と問題数</CardTitle>
              <CardDescription>過去7日間の学習活動</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="学習時間" fill="#3b82f6" name="学習時間(分)" />
                  <Bar dataKey="問題数" fill="#10b981" name="問題数" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 正答率推移 */}
          <Card>
            <CardHeader>
              <CardTitle>正答率の推移</CardTitle>
              <CardDescription>過去7日間の正答率</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="正答率" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="正答率(%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* スキル別進捗と最近の活動 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* スキル別進捗 */}
          <Card>
            <CardHeader>
              <CardTitle>スキル別習熟度</CardTitle>
              <CardDescription>各分野の理解度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillData.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-gray-600">{skill.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${skill.value}%`,
                          backgroundColor: skill.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 最近の活動 */}
          <Card>
            <CardHeader>
              <CardTitle>最近の活動</CardTitle>
              <CardDescription>直近の学習履歴</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-4 py-2">
                    <p className="text-xs text-gray-500">{activity.date}</p>
                    <p className="font-medium text-sm">{activity.activity}</p>
                    <p className="text-sm text-gray-600">{activity.result}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI分析レポート */}
        <Card>
          <CardHeader>
            <CardTitle>AI学習分析レポート</CardTitle>
            <CardDescription>お子様の学習傾向と推奨事項</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📊 学習パターン分析</h4>
              <p className="text-sm text-blue-800">
                お子様は平日よりも週末に長時間学習する傾向があります。
                特に土曜日の学習時間が最も長く、集中力も高い状態です。
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ 強みの分野</h4>
              <p className="text-sm text-green-800">
                比較問題の正答率が92%と非常に高く、数の大小関係の理解が優れています。
                この強みを活かして、より高度な問題にチャレンジすることをお勧めします。
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 改善が必要な分野</h4>
              <p className="text-sm text-yellow-800">
                図形問題の習熟度が70%とやや低めです。
                実物を使った学習や、日常生活の中で図形を探す遊びを取り入れると効果的です。
              </p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <h4 className="font-semibold text-purple-900 mb-2">💡 推奨事項</h4>
              <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>1日15〜20分の学習習慣を継続しましょう</li>
                <li>図形の理解を深めるため、積み木やパズルを活用してください</li>
                <li>正答率が高い日は積極的に褒めて、モチベーションを維持しましょう</li>
                <li>ストーリーモードを活用して、楽しみながら学習を進めましょう</li>
              </ul>
            </div>

            <div className="bg-gray-50 border-l-4 border-gray-500 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📈 今後の目標</h4>
              <p className="text-sm text-gray-800">
                現在のペースを維持すれば、2週間以内にレベル{profile.level + 1}に到達できる見込みです。
                引き続き、お子様の学習をサポートしてあげてください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 学習指導要領対応表 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>学習指導要領対応状況</CardTitle>
            <CardDescription>文部科学省の学習指導要領に基づいた進捗</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">分野</th>
                    <th className="text-left py-2 px-4">学習内容</th>
                    <th className="text-left py-2 px-4">進捗状況</th>
                    <th className="text-left py-2 px-4">習熟度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">数と計算</td>
                    <td className="py-2 px-4">10までの数の構成と順序</td>
                    <td className="py-2 px-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">完了</span>
                    </td>
                    <td className="py-2 px-4">90%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">数と計算</td>
                    <td className="py-2 px-4">加法(足し算)</td>
                    <td className="py-2 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">学習中</span>
                    </td>
                    <td className="py-2 px-4">85%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">数と計算</td>
                    <td className="py-2 px-4">減法(引き算)</td>
                    <td className="py-2 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">学習中</span>
                    </td>
                    <td className="py-2 px-4">78%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">図形</td>
                    <td className="py-2 px-4">基本的な図形の認識</td>
                    <td className="py-2 px-4">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">開始済み</span>
                    </td>
                    <td className="py-2 px-4">70%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">測定</td>
                    <td className="py-2 px-4">時刻の読み方</td>
                    <td className="py-2 px-4">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">未開始</span>
                    </td>
                    <td className="py-2 px-4">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
