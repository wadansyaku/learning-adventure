import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ParentDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // TODO: 実際には親子関係のデータベース設計が必要
  // 現在はデモデータを表示
  
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'parent' && user?.role !== 'admin'))) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  // デモデータ
  const weeklyData = [
    { date: '月', studyTime: 25, problemsSolved: 15, accuracy: 80 },
    { date: '火', studyTime: 30, problemsSolved: 20, accuracy: 85 },
    { date: '水', studyTime: 0, problemsSolved: 0, accuracy: 0 },
    { date: '木', studyTime: 35, problemsSolved: 25, accuracy: 90 },
    { date: '金', studyTime: 40, problemsSolved: 30, accuracy: 87 },
    { date: '土', studyTime: 45, problemsSolved: 35, accuracy: 92 },
    { date: '日', studyTime: 20, problemsSolved: 12, accuracy: 75 },
  ];

  const skillData = [
    { skill: 'たしざん', progress: 85 },
    { skill: 'ひきざん', progress: 70 },
    { skill: 'くらべる', progress: 90 },
    { skill: 'かぞえる', progress: 95 },
    { skill: 'かたち', progress: 60 },
  ];

  const overview = {
    totalStudyTime: 195, // 分
    problemsSolved: 137,
    averageAccuracy: 84,
    currentLevel: 8,
    loginStreak: 5,
  };

  const recentAchievements = [
    { name: 'はじめのいっぽ', date: '2024-01-15', icon: '🎯' },
    { name: '10もんクリア', date: '2024-01-16', icon: '⭐' },
    { name: 'レベル5', date: '2024-01-18', icon: '🔥' },
    { name: 'まいにちがんばる', date: '2024-01-20', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-primary mb-2">
              ほごしゃダッシュボード
            </h1>
            <p className="text-muted-foreground">おこさまのがくしゅうじょうきょう</p>
          </div>
          <div className="flex gap-2">
            <RoleSwitcher />
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
            >
              ホームへ
            </Button>
          </div>
        </div>

        {/* 概要カード */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            <div className="text-sm opacity-90">そうがくしゅうじかん</div>
            <div className="text-3xl font-black mt-2">{overview.totalStudyTime}ぷん</div>
            <div className="text-xs opacity-75 mt-1">こんしゅう</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-400 to-green-600 text-white">
            <div className="text-sm opacity-90">といたもんだい</div>
            <div className="text-3xl font-black mt-2">{overview.problemsSolved}もん</div>
            <div className="text-xs opacity-75 mt-1">こんしゅう</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 text-white">
            <div className="text-sm opacity-90">せいとうりつ</div>
            <div className="text-3xl font-black mt-2">{overview.averageAccuracy}%</div>
            <div className="text-xs opacity-75 mt-1">へいきん</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 text-white">
            <div className="text-sm opacity-90">げんざいのレベル</div>
            <div className="text-3xl font-black mt-2">Lv.{overview.currentLevel}</div>
            <div className="text-xs opacity-75 mt-1">せいちょうちゅう</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-pink-400 to-pink-600 text-white">
            <div className="text-sm opacity-90">れんぞくログイン</div>
            <div className="text-3xl font-black mt-2">{overview.loginStreak}にち</div>
            <div className="text-xs opacity-75 mt-1">🔥 がんばってる!</div>
          </Card>
        </div>

        {/* グラフエリア */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* 学習時間の推移 */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">📊 がくしゅうじかんのすいい</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="studyTime" stroke="#8b5cf6" strokeWidth={3} name="がくしゅうじかん(ぷん)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 正答率の推移 */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">📈 せいとうりつのすいい</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} name="せいとうりつ(%)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 問題数の推移 */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">📝 といたもんだいすう</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="problemsSolved" fill="#3b82f6" name="もんだいすう" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* スキル別進捗 */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">🎯 スキルべつしんちょく</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="しんちょく" dataKey="progress" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* AI分析レポート */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <h3 className="text-2xl font-bold mb-4">🤖 AIぶんせきレポート</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <div className="font-bold text-green-600">よくできています!</div>
                  <p className="text-sm text-muted-foreground">
                    こんしゅうは5にちログインして、あわせて195ぷんがくしゅうしました。もくひょうたっせい!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-3xl">⭐</div>
                <div>
                  <div className="font-bold text-blue-600">とくいなぶんや</div>
                  <p className="text-sm text-muted-foreground">
                    たしざんがとくいになってきました! せいとうりつ90%いじょうです。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💡</div>
                <div>
                  <div className="font-bold text-orange-600">ちゅういてん</div>
                  <p className="text-sm text-muted-foreground">
                    ひきざんでときどきまちがえます。10までのひきざんをふくしゅうするとよいでしょう。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎯</div>
                <div>
                  <div className="font-bold text-purple-600">ていあん</div>
                  <p className="text-sm text-muted-foreground">
                    1かいのがくしゅうじかんが30ぷんをこえるようになりました! つぎは45ぷんをめざしましょう。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 最近の実績 */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">🏆 さいきんのじっせき</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-200">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-bold">{achievement.name}</div>
                <div className="text-xs text-muted-foreground">{achievement.date}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* 注意書き */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>※ このデータはデモデータです。じっさいのおこさまのデータをひょうじするには、しんしかんけいのせっていがひつようです。</p>
        </div>
      </div>
    </div>
  );
}
