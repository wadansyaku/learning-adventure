import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function StudentDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: profile, isLoading: profileLoading } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const { data: tasks } = trpc.task.getMyTasks.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const { data: characters } = trpc.character.getMyCharacters.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md">
          <h2 className="text-3xl font-bold mb-4">プロフィールがありません</h2>
          <p className="mb-4">せんせいにそうだんしてね</p>
          <Button onClick={() => setLocation('/')}>ホームにもどる</Button>
        </Card>
      </div>
    );
  }

  const xpForNextLevel = 100;
  const currentLevelXP = profile.xp % 100;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-shadow">
              {profile.displayName}さん
            </h1>
            <p className="text-xl text-muted-foreground">がんばってるね!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="coin-display">
              <span className="text-3xl">🪙</span>
              <span className="text-2xl">{profile.coins}</span>
            </div>
            <div className="level-badge">
              {profile.level}
            </div>
          </div>
        </div>

        {/* XPバー */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">けいけんち</span>
            <span className="text-muted-foreground">{currentLevelXP} / {xpForNextLevel} XP</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
          </div>
        </Card>

        {/* キャラクター表示 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">なかまたち</h2>
          {characters && characters.length > 0 ? (
            <div className="character-stage">
              <div className="flex items-center justify-center h-full">
                <div className="text-9xl animate-bounce-slow">
                  {characters[0].animalType === 'rabbit' && '🐰'}
                  {characters[0].animalType === 'cat' && '🐱'}
                  {characters[0].animalType === 'dog' && '🐶'}
                  {characters[0].animalType === 'bear' && '🐻'}
                  {characters[0].animalType === 'fox' && '🦊'}
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-xl mb-4">まだなかまがいないよ</p>
              <p className="text-muted-foreground">せんせいになかまをつくってもらおう!</p>
            </Card>
          )}
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="card-fun">
            <h3 className="text-2xl font-bold mb-4">もんだいにチャレンジ!</h3>
            <p className="mb-4 text-muted-foreground">たのしいもんだいをといてXPをゲット!</p>
            <Button 
              className="btn-fun bg-primary text-primary-foreground w-full"
              onClick={() => setLocation('/play')}
            >
              あそぶ 🎮
            </Button>
          </Card>

          <Card className="card-fun">
            <h3 className="text-2xl font-bold mb-4">しゅくだい</h3>
            <p className="mb-4 text-muted-foreground">
              {pendingTasks.length > 0 
                ? `${pendingTasks.length}このしゅくだいがあるよ!` 
                : 'しゅくだいはないよ!'}
            </p>
            <div className="text-4xl text-center">
              {pendingTasks.length > 0 ? '📚' : '✨'}
            </div>
          </Card>
        </div>

        {/* 進捗表示 */}
        {completedTasks.length > 0 && (
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">できたこと ✨</h3>
            <div className="space-y-2">
              {completedTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <span className="text-2xl">✅</span>
                  <span className="font-medium">{task.title}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
