import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Gacha() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const { data: profile, refetch: refetchProfile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  const rollGachaMutation = trpc.gacha.roll.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setShowResult(true);
      setIsRolling(false);
      refetchProfile();
      
      // レアリティに応じた紙吹雪演出
      if (data.item.rarity === 'legendary') {
        // レジェンダリー: 豪華な金色の紙吹雪
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ffed4e', '#ff6b00', '#ffa500'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 120,
            origin: { y: 0.4 },
            colors: ['#ffd700', '#ffed4e', '#ff6b00'],
          });
        }, 300);
      } else if (data.item.rarity === 'epic') {
        // エピック: 紫色の紙吹雪
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#c084fc', '#e879f9'],
        });
      } else if (data.item.rarity === 'rare') {
        // レア: 青色の紙吹雪
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
        });
      }
      
      // レアリティに応じたメッセージ
      const rarityMessages: Record<string, string> = {
        common: 'ノーマルだよ!',
        rare: 'レアだ!すごい!',
        epic: 'エピック!やったね!',
        legendary: 'レジェンダリー!!!すごすぎる!!!',
      };
      
      toast.success(rarityMessages[data.item.rarity] || 'アイテムゲット!', {
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsRolling(false);
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'admin'))) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  const handleRoll = () => {
    if (!profile) {
      toast.error('プロフィールがよみこめませんでした');
      return;
    }
    
    if (profile.coins < 10) {
      toast.error('コインがたりないよ! もっとべんきょうしよう!');
      return;
    }

    setIsRolling(true);
    setShowResult(false);
    
    // アニメーション演出のため少し遅延
    setTimeout(() => {
      rollGachaMutation.mutate();
    }, 1500);
  };

  const handleClose = () => {
    setShowResult(false);
    setResult(null);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 bg-gray-100';
      case 'rare':
        return 'text-blue-600 bg-blue-100';
      case 'epic':
        return 'text-purple-600 bg-purple-100';
      case 'legendary':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'ノーマル';
      case 'rare':
        return 'レア';
      case 'epic':
        return 'エピック';
      case 'legendary':
        return 'レジェンダリー';
      default:
        return rarity;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
      <div className="container max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/student')}
            className="hover:scale-105 transition-transform"
          >
            ← もどる
          </Button>
          <motion.div 
            className="coin-display bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-3 rounded-full shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-3xl">🪙</span>
            <span className="text-3xl font-black text-white ml-2">{profile.coins}</span>
          </motion.div>
        </div>

        {/* タイトル */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-6xl font-black mb-4 text-shadow bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ ガチャ ✨
          </motion.h1>
          <p className="text-2xl font-bold text-purple-600">
            コイン10まいで1かいひけるよ!
          </p>
        </motion.div>

        {/* ガチャマシン */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-yellow-200 to-orange-200 border-4 border-yellow-400">
          <div className="text-center space-y-6">
            {!isRolling && !showResult && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <motion.div 
                  className="text-9xl"
                  animate={{ 
                    rotate: [0, 10, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎰
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="btn-fun w-full max-w-md mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-4xl py-12 shadow-2xl font-black"
                    onClick={handleRoll}
                    disabled={profile.coins < 10}
                  >
                    {profile.coins >= 10 ? 'ガチャをひく! 🎲' : 'コインがたりない... 😢'}
                  </Button>
                </motion.div>
                <p className="text-xl font-bold text-purple-600 mt-4">
                  ひつよう: 🪙 10コイン
                </p>
              </motion.div>
            )}

            {isRolling && !showResult && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div 
                  className="text-9xl"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.5, repeat: Infinity }
                  }}
                >
                  ✨
                </motion.div>
                <motion.h2 
                  className="text-5xl font-black"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    color: ['#a855f7', '#ec4899', '#3b82f6', '#a855f7']
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ガチャちゅう...
                </motion.h2>
              </motion.div>
            )}

            <AnimatePresence>
              {showResult && result && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                {/* レアリティ別の背景エフェクト */}
                <div className={`absolute inset-0 opacity-20 animate-pulse ${
                  result.item.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300' :
                  result.item.rarity === 'epic' ? 'bg-gradient-to-r from-purple-300 via-purple-500 to-purple-300' :
                  result.item.rarity === 'rare' ? 'bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300' :
                  'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200'
                }`} />
                
                <div className="relative z-10">
                  <motion.div 
                    className={`flex justify-center items-center h-64 ${
                    result.item.rarity === 'legendary' ? 'filter drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]' :
                    result.item.rarity === 'epic' ? 'filter drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]' :
                    result.item.rarity === 'rare' ? 'filter drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]' :
                    ''
                  }`}
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {result.item.imageUrl ? (
                      <img 
                        src={result.item.imageUrl} 
                        alt={result.item.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-9xl">🎁</span>
                    )}
                  </motion.div>
                  
                  <motion.div 
                    className={`inline-block px-8 py-3 rounded-full text-2xl font-black ${getRarityColor(result.item.rarity)}`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {getRarityLabel(result.item.rarity)}
                  </motion.div>
                  
                  <motion.h2 
                    className="text-5xl font-black"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {result.item.name}
                  </motion.h2>
                  
                  <motion.p 
                    className="text-2xl text-muted-foreground"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {result.item.description}
                  </motion.p>
                  
                  {/* 重複ボーナス表示 */}
                  {result.isDuplicate && result.bonusCoins > 0 && (
                    <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-xl animate-bounce">
                      <p className="text-2xl font-bold text-yellow-800">
                        🎉 もってるアイテムだった! 🎉
                      </p>
                      <p className="text-xl text-yellow-700">
                        ボーナスコイン +{result.bonusCoins}🪙
                      </p>
                    </div>
                  )}
                </div>
                <motion.div 
                  className="flex gap-4 justify-center relative z-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    className="btn-fun bg-primary text-primary-foreground text-xl px-8 py-6"
                    onClick={handleClose}
                  >
                    とじる
                  </Button>
                  <Button
                    className="btn-fun bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl px-8 py-6"
                    onClick={handleRoll}
                    disabled={profile.coins < 10}
                  >
                    もう1かい!
                  </Button>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </Card>

        {/* 確率表示 */}
        <Card className="p-6 bg-white/80">
          <h3 className="text-2xl font-bold mb-4">でてくるかくりつ</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">⚪ ノーマル</span>
              <span className="font-bold">60%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600">🔵 レア</span>
              <span className="font-bold">30%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-600">🟣 エピック</span>
              <span className="font-bold">9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-600">⭐ レジェンダリー</span>
              <span className="font-bold">1%</span>
            </div>
          </div>
        </Card>


      </div>
    </div>
  );
}
