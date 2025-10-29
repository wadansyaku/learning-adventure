import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Sword, Sparkles, Trophy, Zap, Crown, Star } from "lucide-react";

export default function Tasks() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // 生徒情報を取得
  const { data: student, isLoading: studentLoading } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  // タスク一覧を取得
  const { data: tasks, isLoading: tasksLoading } = trpc.task.getMyTasks.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || studentLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-white">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks?.filter(t => t.status !== 'completed') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  // レアリティ別のスタイル
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          bg: 'from-yellow-400 via-amber-500 to-orange-500',
          border: 'border-yellow-400',
          icon: Crown,
          glow: 'shadow-2xl shadow-yellow-500/50',
        };
      case 'epic':
        return {
          bg: 'from-purple-500 via-purple-600 to-pink-600',
          border: 'border-purple-400',
          icon: Star,
          glow: 'shadow-2xl shadow-purple-500/50',
        };
      case 'rare':
        return {
          bg: 'from-blue-500 via-blue-600 to-cyan-600',
          border: 'border-blue-400',
          icon: Sparkles,
          glow: 'shadow-xl shadow-blue-500/40',
        };
      default:
        return {
          bg: 'from-green-500 via-green-600 to-emerald-600',
          border: 'border-green-400',
          icon: Zap,
          glow: 'shadow-lg shadow-green-500/30',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8 animate-bounce-slow">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-2xl">
            <Sword className="w-16 h-16 text-white mx-auto mb-2" />
            <h1 className="text-5xl font-black text-white text-shadow-lg">スペシャルクエスト ⚔️</h1>
            <p className="text-xl text-white/90 mt-2">ぼうけんにでかけよう!</p>
          </div>
        </div>

        {/* 生徒情報カード */}
        {student && (
          <Card className="mb-8 bg-white/95 backdrop-blur-sm border-4 border-white shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{student.avatarIcon || '🧒'}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-purple-600">{student.displayName}</h2>
                    <p className="text-lg text-gray-600">レベル {student.level}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl px-6 py-3 shadow-lg">
                    <p className="text-sm font-bold text-yellow-900">コイン</p>
                    <p className="text-3xl font-black text-white">{student.coins}</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl px-6 py-3 shadow-lg">
                    <p className="text-sm font-bold text-pink-100">ジェム</p>
                    <p className="text-3xl font-black text-white">{student.gems}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 未完了のクエスト */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-white mb-6 flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            ちょうせんちゅうのクエスト
          </h2>
          {pendingTasks.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm border-4 border-white shadow-2xl">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2 text-purple-600">クエストはないよ!</h3>
                <p className="text-xl text-gray-600">すべてのクエストをクリアしたね! すごい!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingTasks.map((task) => {
                const rarityStyle = getRarityStyle(task.rarity);
                const RarityIcon = rarityStyle.icon;
                
                return (
                  <Card 
                    key={task.id} 
                    className={`bg-gradient-to-br ${rarityStyle.bg} border-4 ${rarityStyle.border} ${rarityStyle.glow} transform hover:scale-105 transition-all`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                          <RarityIcon className="w-6 h-6" />
                          {task.title}
                        </CardTitle>
                        <div className="bg-white/30 backdrop-blur-sm rounded-full px-3 py-1">
                          <p className="text-sm font-bold text-white uppercase">{task.rarity}</p>
                        </div>
                      </div>
                      <CardDescription className="text-white/90 text-lg">
                        {task.description || 'がんばってクリアしよう!'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm font-bold text-white/80">XP</p>
                            <p className="text-2xl font-black text-white">+{task.xpReward}</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white/80">コイン</p>
                            <p className="text-2xl font-black text-yellow-300">+{task.coinReward}</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white/80">ジェム</p>
                            <p className="text-2xl font-black text-pink-300">+{task.gemReward}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          // クエストの種類に応じてリダイレクト
                          if (task.taskType === 'app_problem') {
                            setLocation('/challenge');
                          } else {
                            // 学校の宿題の場合は完了報告画面へ
                            setLocation(`/quest/${task.id}`);
                          }
                        }}
                        className="w-full bg-white hover:bg-white/90 text-purple-600 font-black text-xl py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                      >
                        クエストをはじめる! 🚀
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 完了したクエスト */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-4xl font-black text-white mb-6 flex items-center gap-3">
              <Star className="w-10 h-10" />
              クリアしたクエスト
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedTasks.map((task) => {
                const rarityStyle = getRarityStyle(task.rarity);
                const RarityIcon = rarityStyle.icon;
                
                return (
                  <Card 
                    key={task.id} 
                    className="bg-white/95 backdrop-blur-sm border-4 border-green-400 shadow-xl opacity-75"
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl font-black text-gray-600 flex items-center gap-2">
                        <RarityIcon className="w-6 h-6" />
                        {task.title}
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        {task.description || 'クリアしたよ!'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-green-100 rounded-2xl p-4 text-center">
                        <p className="text-xl font-bold text-green-600">✅ クリア!</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString('ja-JP') : ''}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 戻るボタン */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => setLocation('/student')}
            variant="outline"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white font-bold text-lg px-8 py-6 rounded-xl"
          >
            ダッシュボードにもどる
          </Button>
        </div>
      </div>
    </div>
  );
}
