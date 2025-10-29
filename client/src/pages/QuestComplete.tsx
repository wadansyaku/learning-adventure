import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { useEffect, useState } from "react";
import { Sparkles, Trophy, Coins, Gem } from "lucide-react";
import { toast } from "sonner";

export default function QuestComplete() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const questId = params.id ? parseInt(params.id) : null;
  const [isCompleting, setIsCompleting] = useState(false);
  const [rewards, setRewards] = useState<{ xpEarned: number; coinsEarned: number; gemsEarned: number } | null>(null);

  const { data: tasks } = trpc.task.getMyTasks.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const completeTaskMutation = trpc.task.complete.useMutation({
    onSuccess: (data) => {
      setRewards({
        xpEarned: data.xpEarned || 0,
        coinsEarned: data.coinsEarned || 0,
        gemsEarned: data.gemsEarned || 0,
      });
      setIsCompleting(false);
      toast.success('クエストクリア!');
    },
    onError: (error) => {
      console.error('Failed to complete quest:', error);
      toast.error('クエストの完了に失敗しました');
      setIsCompleting(false);
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || !questId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-white">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  const quest = tasks?.find(t => t.id === questId);

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">クエストがみつかりません</h2>
            <Button onClick={() => setLocation('/tasks')}>クエストいちらんにもどる</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleComplete = () => {
    if (isCompleting) return;
    setIsCompleting(true);
    completeTaskMutation.mutate({ taskId: questId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
      <div className="max-w-4xl mx-auto">
        {!rewards ? (
          // クエスト完了前
          <div className="text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-2xl mb-8">
              <Trophy className="w-16 h-16 text-white mx-auto mb-2" />
              <h1 className="text-5xl font-black text-white text-shadow-lg">クエストほうこく</h1>
            </div>

            <Card className="bg-white/95 backdrop-blur-sm border-4 border-white shadow-2xl">
              <CardContent className="p-12">
                <h2 className="text-4xl font-black text-purple-600 mb-6">{quest.title}</h2>
                <p className="text-xl text-gray-600 mb-8">{quest.description || 'クエストをかんりょうしたかな?'}</p>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-purple-600 mb-4">ほうしゅう</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-600">XP</p>
                      <p className="text-3xl font-black text-purple-600">+{quest.xpReward}</p>
                    </div>
                    <div className="text-center">
                      <Coins className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-600">コイン</p>
                      <p className="text-3xl font-black text-yellow-600">+{quest.coinReward}</p>
                    </div>
                    <div className="text-center">
                      <Gem className="w-12 h-12 text-pink-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-600">ジェム</p>
                      <p className="text-3xl font-black text-pink-600">+{quest.gemReward}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-2xl py-8 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                >
                  {isCompleting ? 'かんりょうちゅう...' : 'クエストをかんりょうする! 🎉'}
                </Button>

                <Button
                  onClick={() => setLocation('/tasks')}
                  variant="outline"
                  className="w-full mt-4 border-2 border-gray-300 text-gray-600 font-bold text-lg py-6"
                >
                  もどる
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // クエスト完了後（報酬演出）
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <div className="inline-block animate-bounce">
                <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-4 drop-shadow-2xl" />
              </div>
              <h1 className="text-6xl font-black text-white text-shadow-lg mb-4 animate-pulse">
                クエストクリア! 🎉
              </h1>
              <p className="text-3xl font-bold text-white/90">すごい! よくできました!</p>
            </div>

            <Card className="bg-white/95 backdrop-blur-sm border-4 border-yellow-400 shadow-2xl">
              <CardContent className="p-12">
                <h2 className="text-3xl font-black text-purple-600 mb-8">ほうしゅうをゲット!</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 transform hover:scale-105 transition-all shadow-xl">
                    <Sparkles className="w-16 h-16 text-white mx-auto mb-2" />
                    <p className="text-white/90 font-bold mb-1">XP</p>
                    <p className="text-5xl font-black text-white">+{rewards.xpEarned}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 transform hover:scale-105 transition-all shadow-xl">
                    <Coins className="w-16 h-16 text-white mx-auto mb-2" />
                    <p className="text-yellow-900 font-bold mb-1">コイン</p>
                    <p className="text-5xl font-black text-white">+{rewards.coinsEarned}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 transform hover:scale-105 transition-all shadow-xl">
                    <Gem className="w-16 h-16 text-white mx-auto mb-2" />
                    <p className="text-pink-100 font-bold mb-1">ジェム</p>
                    <p className="text-5xl font-black text-white">+{rewards.gemsEarned}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => setLocation('/student')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-2xl py-8 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                  >
                    ダッシュボードにもどる 🏠
                  </Button>
                  
                  <Button
                    onClick={() => setLocation('/tasks')}
                    variant="outline"
                    className="w-full border-2 border-purple-300 text-purple-600 font-bold text-lg py-6"
                  >
                    ほかのクエストをみる
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
