import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { LevelUpModal } from "@/components/LevelUpModal";
import { LoginBonus } from "@/components/LoginBonus";
import { DailyMissions } from "@/components/DailyMissions";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showLoginBonus, setShowLoginBonus] = useState(true);
  const [previousLevel, setPreviousLevel] = useState(0);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
    retry: false,
  });

  const createProfileMutation = trpc.student.createProfile.useMutation({
    onSuccess: () => {
      console.log('[StudentDashboard] Profile created successfully');
      toast.success('プロフィールを作成しました!');
      refetch();
      setIsCreatingProfile(false);
    },
    onError: (error) => {
      console.error('[StudentDashboard] Failed to create profile:', error);
      toast.error('プロフィールの作成に失敗しました');
      setIsCreatingProfile(false);
    },
  });

  console.log('[StudentDashboard] State:', { 
    isAuthenticated, 
    userRole: user?.role, 
    profile, 
    profileLoading, 
    profileError 
  });

  // プロフィールがない場合、自動作成
  useEffect(() => {
    if (!profileLoading && !profile && isAuthenticated && user?.role === 'student' && !isCreatingProfile) {
      console.log('[StudentDashboard] Profile not found, creating automatically');
      console.log('[StudentDashboard] User info:', user);
      setIsCreatingProfile(true);
      createProfileMutation.mutate({
        displayName: user.name || '生徒',
        avatarIcon: '🐰',
      });
    }
  }, [profileLoading, profile, isAuthenticated, user?.id, user?.role, isCreatingProfile]);

  const { data: tasks } = trpc.task.getMyTasks.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const { data: characters } = trpc.character.getMyCharacters.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  useEffect(() => {
    console.log('[StudentDashboard] Auth check:', { authLoading, isAuthenticated, userRole: user?.role });
    if (!authLoading && !isAuthenticated) {
      console.log('[StudentDashboard] Redirecting to home - not authenticated');
      setLocation('/');
    } else if (!authLoading && isAuthenticated && user?.role !== 'student' && user?.role !== 'admin') {
      console.log('[StudentDashboard] Redirecting to home - not student or admin');
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || profileLoading || isCreatingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  // プロフィールがない場合は自動作成されるので、ここには到達しないはず
  if (!profile && !profileLoading && !isCreatingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md">
          <h2 className="text-3xl font-bold mb-4">プロフィールの作成に失敗しました</h2>
          <p className="mb-4">せんせいにそうだんしてね</p>
          <Button onClick={() => setLocation('/')}>ホームにもどる</Button>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
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
            <RoleSwitcher />
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
                {characters[0].imageUrl ? (
                  <img 
                    src={characters[0].imageUrl} 
                    alt={characters[0].name}
                    className="w-64 h-64 object-contain animate-bounce-slow"
                  />
                ) : (
                  <div className="text-9xl animate-bounce-slow">
                    {characters[0].animalType === 'rabbit' && '🐰'}
                    {characters[0].animalType === 'cat' && '🐱'}
                    {characters[0].animalType === 'dog' && '🐶'}
                    {characters[0].animalType === 'bear' && '🐻'}
                    {characters[0].animalType === 'fox' && '🦊'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-xl mb-4">まだなかまがいないよ</p>
              <p className="text-muted-foreground mb-4">なかまをえらんでぼうけんにでかけよう!</p>
              <Button 
                className="btn-fun bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                onClick={() => setLocation('/character-select')}
              >
                なかまをえらぶ ✨
              </Button>
            </Card>
          )}
        </div>

        {/* アクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <h3 className="text-2xl font-bold mb-4">ガチャ</h3>
            <p className="mb-4 text-muted-foreground">アイテムをげっとしよう!</p>
            <Button 
              className="btn-fun bg-gradient-to-r from-purple-500 to-pink-500 text-white w-full"
              onClick={() => setLocation('/gacha')}
            >
              ガチャをひく ✨
            </Button>
          </Card>

          <Card className="card-fun">
            <h3 className="text-2xl font-bold mb-4">ぼうけん</h3>
            <p className="mb-4 text-muted-foreground">たのしいおはなしをよもう!</p>
            <Button 
              className="btn-fun bg-gradient-to-r from-orange-500 to-red-500 text-white w-full"
              onClick={() => setLocation('/story')}
            >
              ぼうけんへ 🗺️
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

        {/* 実績ボタン */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-100 to-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <h3 className="text-2xl font-bold mb-1">じっせき</h3>
                <p className="text-muted-foreground">あちこうしたことをみよう!</p>
              </div>
            </div>
            <Button 
              className="btn-fun bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
              onClick={() => setLocation('/achievements')}
            >
              じっせきをみる 🏆
            </Button>
          </div>
        </Card>

        {/* デイリーミッション */}
        <DailyMissions />

        {/* キャラクター会話ボタン */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-100 to-pink-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🐻</div>
              <div>
                <h3 className="text-2xl font-bold mb-1">おはなししよう!</h3>
                <p className="text-muted-foreground">キャラクターとおはなししよう</p>
              </div>
            </div>
            <Button 
              className="btn-fun bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              onClick={() => setLocation('/chat')}
            >
              おはなしする 💬
            </Button>
          </div>
        </Card>

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

      {/* レベルアップモーダル */}
      {showLevelUp && (
        <LevelUpModal 
          newLevel={newLevel} 
          onClose={() => setShowLevelUp(false)} 
        />
      )}

      {/* ログインボーナス */}
      {showLoginBonus && (
        <LoginBonus onClose={() => setShowLoginBonus(false)} />
      )}
    </div>
  );
}
