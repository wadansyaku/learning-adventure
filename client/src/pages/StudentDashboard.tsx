import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { LevelUpModal } from "@/components/LevelUpModal";
import { LoginBonus } from "@/components/LoginBonus";
import { DailyMissions } from "@/components/DailyMissions";
import { toast } from "sonner";
import StudentHeader from '../components/StudentHeader';
import CharacterChat from '../components/CharacterChat';
export default function StudentDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showLoginBonus, setShowLoginBonus] = useState(true);
  const [previousLevel, setPreviousLevel] = useState(0);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(0);
  
  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
    retry: false,
  });

  const { data: myItems } = trpc.gacha.getMyItems.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  const createProfileMutation = trpc.student.createProfile.useMutation({
    onSuccess: () => {
      console.log('[StudentDashboard] Profile created successfully');
      // toast.success('プロフィールを作成しました!');
      refetch();
      setIsCreatingProfile(false);
    },
    onError: (error) => {
      console.error('[StudentDashboard] Failed to create profile:', error);
      // toast.error('プロフィールの作成に失敗しました');
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
    if (!profileLoading && !profile && isAuthenticated && (user?.role === 'student' || user?.role === 'admin') && !isCreatingProfile) {
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
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  const { data: characters } = trpc.character.getMy.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-shadow">
              {profile.displayName}さん
            </h1>
            <p className="text-xl text-muted-foreground">がんばってるね!</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleSwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await user.logout();
                setLocation('/');
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </Button>
          </div>
        </div>

        {/* ステータスヘッダー */}
        <StudentHeader
          level={profile.level}
          xp={currentLevelXP}
          coins={profile.coins}
          gems={profile.gems}
          nextLevelXP={xpForNextLevel}
        />

        {/* キャラクター表示 - 大型化とアニメーション強化 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">なかまたち</h2>
            <div className="flex gap-2">
              {characters && characters.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length)}
                    className="hover:scale-105 transition-transform"
                  >
                    ← まえ
                  </Button>
                  <span className="text-sm text-muted-foreground flex items-center font-semibold">
                    {selectedCharacterIndex + 1} / {characters.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCharacterIndex((prev) => (prev + 1) % characters.length)}
                    className="hover:scale-105 transition-transform"
                  >
                    つぎ →
                  </Button>
                </>
              )}
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform shadow-lg"
                size="sm"
                onClick={() => setLocation('/character-select')}
              >
                なかまをえらぶ ✨
              </Button>
            </div>
          </div>
          {characters && characters.length > 0 ? (
            <Card className="character-stage bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-4 border-purple-200 shadow-2xl overflow-hidden">
              <div className="flex flex-col items-center justify-center h-full py-12">
                <motion.div 
                  className="relative"
                  key={selectedCharacterIndex}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {characters[selectedCharacterIndex].imageUrl ? (
                      <img 
                        src={characters[selectedCharacterIndex].imageUrl} 
                        alt={characters[selectedCharacterIndex].name}
                        className="w-96 h-96 object-contain drop-shadow-2xl"
                      />
                    ) : (
                      <div className="text-[200px] drop-shadow-2xl">
                        {characters[selectedCharacterIndex].animalType === 'rabbit' && '🐰'}
                        {characters[selectedCharacterIndex].animalType === 'cat' && '🐱'}
                        {characters[selectedCharacterIndex].animalType === 'dog' && '🐶'}
                        {characters[selectedCharacterIndex].animalType === 'bear' && '🐻'}
                        {characters[selectedCharacterIndex].animalType === 'fox' && '🦊'}
                      </div>
                    )}
                  </motion.div>
                  {/* 装備中の帽子を表示 */}
                  {myItems && myItems.find(item => item.isEquipped && (item.characterId === null || item.characterId === characters[selectedCharacterIndex].id)) && (
                    <motion.img 
                      src={myItems.find(item => item.isEquipped && (item.characterId === null || item.characterId === characters[selectedCharacterIndex].id))!.imageUrl || ''}
                      alt="装備中の帽子"
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-48 h-48 object-contain drop-shadow-xl"
                      animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
                <motion.div 
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {characters[selectedCharacterIndex].name}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-purple-600">Lv.{characters[selectedCharacterIndex].level}</span>
                    <span className="text-xl">💫</span>
                  </div>
                </motion.div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-dashed border-purple-300">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <p className="text-3xl font-bold mb-4">まだなかまがいないよ</p>
                <p className="text-xl text-muted-foreground mb-6">なかまをえらんでいっしょにがんばろう!</p>
                <Button 
                  className="btn-fun bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl py-6 px-8 hover:scale-105 transition-transform shadow-xl"
                  onClick={() => setLocation('/character-select')}
                >
                  なかまをえらぶ ✨
                </Button>
              </motion.div>
            </Card>
          )}
        </motion.div>

        {/* キャラクター会話 */}
        {characters && characters.length > 0 && (
          <CharacterChat
            characterName={characters[selectedCharacterIndex].name}
            characterEmoji={
              characters[selectedCharacterIndex].animalType === 'rabbit' ? '🐰' :
              characters[selectedCharacterIndex].animalType === 'cat' ? '🐱' :
              characters[selectedCharacterIndex].animalType === 'dog' ? '🐶' :
              characters[selectedCharacterIndex].animalType === 'bear' ? '🐻' :
              characters[selectedCharacterIndex].animalType === 'fox' ? '🦊' : '🐰'
            }
            studentLevel={profile.level}
            studentXP={profile.xp}
          />
        )}

        {/* アクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* もんだいにチャレンジ */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-400">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">🎮</div>
              <h3 className="text-2xl font-bold text-blue-800 mb-2">もんだいにチャレンジ</h3>
              <p className="text-base text-blue-600 min-h-[48px] flex items-center justify-center">
                たのしいもんだいをといてXPをゲット!
              </p>
            </div>
            <Button 
              className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg"
              onClick={() => setLocation('/play')}
            >
              あそぶ 🎮
            </Button>
          </Card>

          {/* ガチャ */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">✨</div>
              <h3 className="text-2xl font-bold text-purple-800 mb-2">ガチャ</h3>
              <p className="text-base text-purple-600 min-h-[48px] flex items-center justify-center">
                アイテムをげっとしよう!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                className="flex-1 text-sm sm:text-base py-4 sm:py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg min-w-0"
                onClick={() => setLocation('/gacha')}
              >
                <span className="truncate">ガチャ ✨</span>
              </Button>
              <Button 
                variant="outline"
                className="flex-1 text-sm sm:text-base py-4 sm:py-6 border-2 border-purple-400 text-purple-700 hover:bg-purple-100 font-bold shadow-lg min-w-0"
                onClick={() => setLocation('/inventory')}
              >
                <span className="truncate">もちもの 🎒</span>
              </Button>
            </div>
          </Card>

          {/* スペシャルクエスト */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 hover:border-indigo-400">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">⚔️</div>
              <h3 className="text-2xl font-bold text-indigo-800 mb-2">スペシャルクエスト</h3>
              <p className="text-base text-indigo-600 mb-3">
                {pendingTasks.length > 0 
                  ? `${pendingTasks.length}このクエストがあるよ!` 
                  : 'クエストはないよ!'}
              </p>
              {tasks && tasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-indigo-700">
                    <span>進捗状況</span>
                    <span>{completedTasks.length} / {tasks.length}</span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <Button 
              className="w-full text-lg py-6 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold shadow-lg"
              onClick={() => setLocation('/tasks')}
              disabled={pendingTasks.length === 0}
            >
              {pendingTasks.length > 0 ? 'クエストをみる 📚' : 'クエストはないよ ✨'}
            </Button>
          </Card>
        </div>

        {/* ランキングボタン */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-100 to-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <h3 className="text-2xl font-bold mb-1">ランキング</h3>
                <p className="text-muted-foreground">みんなとせいせきをくらべよう!</p>
              </div>
            </div>
            <Button 
              className="btn-fun bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
              onClick={() => setLocation('/ranking')}
            >
              ランキングをみる 🏆
            </Button>
          </div>
        </Card>

        {/* 実績ボタン */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-100 to-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🎖️</div>
              <div>
                <h3 className="text-2xl font-bold mb-1">じっせき</h3>
                <p className="text-muted-foreground">あちこうしたことをみよう!</p>
              </div>
            </div>
            <Button 
              className="btn-fun bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
              onClick={() => setLocation('/achievements')}
            >
              じっせきをみる 🎖️
            </Button>
          </div>
        </Card>

        {/* デイリーミッション */}
        <DailyMissions />

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
