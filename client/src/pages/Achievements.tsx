import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Achievements() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: achievements, isLoading: achievementsLoading } = trpc.achievement.getAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const { data: studentAchievements } = trpc.achievement.getMyAchievements.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || achievementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  const isAchievementUnlocked = (achievementId: number) => {
    return studentAchievements?.some((a: any) => a.achievementId === achievementId);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '👑';
      case 'epic': return '💎';
      case 'rare': return '⭐';
      default: return '🏅';
    }
  };

  const completedCount = studentAchievements?.length || 0;
  const totalCount = achievements?.length || 0;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/student')}
            className="text-lg"
          >
            ← もどる
          </Button>
          <h1 className="text-4xl font-black">じっせき 🏆</h1>
          <div className="w-20"></div>
        </div>

        {/* 進捗サマリー */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-yellow-100 to-orange-100">
          <div className="text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <h2 className="text-3xl font-bold">
              {completedCount} / {totalCount}
            </h2>
            <p className="text-muted-foreground">たっせいしたじっせき</p>
            <Progress value={completionPercentage} className="h-4" />
            <p className="text-sm font-bold text-orange-600">
              {completionPercentage.toFixed(0)}% かんりょう!
            </p>
          </div>
        </Card>

        {/* 実績一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements && achievements.length > 0 ? (
            achievements.map((achievement: any) => {
              const unlocked = isAchievementUnlocked(achievement.id);
              const rarityColor = getRarityColor(achievement.rarity);
              const rarityEmoji = getRarityEmoji(achievement.rarity);

              return (
                <Card 
                  key={achievement.id}
                  className={`p-6 transform transition-all ${
                    unlocked 
                      ? `bg-gradient-to-br ${rarityColor} text-white shadow-xl` 
                      : 'bg-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">
                      {unlocked ? rarityEmoji : '🔒'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-xl font-bold ${unlocked ? 'text-white' : 'text-gray-700'}`}>
                          {achievement.name}
                        </h3>
                        {unlocked && (
                          <span className="text-xs bg-white/30 px-2 py-1 rounded-full">
                            {achievement.rarity}
                          </span>
                        )}
                      </div>
                      <p className={`mb-3 ${unlocked ? 'text-white/90' : 'text-muted-foreground'}`}>
                        {unlocked ? achievement.description : '???'}
                      </p>
                      {unlocked && (
                        <div className="flex gap-3 text-sm">
                          <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                            <span>⭐</span>
                            <span className="font-bold">+{achievement.xpReward}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                            <span>🪙</span>
                            <span className="font-bold">+{achievement.coinReward}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-12 text-center col-span-2">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-2">じっせきはまだないよ</h3>
              <p className="text-muted-foreground">もうすぐじっせきがついかされるよ!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
