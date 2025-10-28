import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Gacha() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const { data: profile, refetch: refetchProfile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const { data: items } = trpc.item.getAll.useQuery();

  const rollGachaMutation = trpc.gacha.roll.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setShowResult(true);
      setIsRolling(false);
      refetchProfile();
      
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
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
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
          <Button variant="outline" onClick={() => setLocation('/student')}>
            ← もどる
          </Button>
          <div className="coin-display">
            <span className="text-3xl">🪙</span>
            <span className="text-2xl font-bold">{profile.coins}</span>
          </div>
        </div>

        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-4 text-shadow animate-bounce-slow">
            ✨ ガチャ ✨
          </h1>
          <p className="text-xl text-muted-foreground">
            コイン10まいで1かいひけるよ!
          </p>
        </div>

        {/* ガチャマシン */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-yellow-200 to-orange-200 border-4 border-yellow-400">
          <div className="text-center space-y-6">
            {!isRolling && !showResult && (
              <>
                <div className="text-9xl animate-bounce-slow">
                  🎰
                </div>
                <Button
                  className="btn-fun w-full max-w-md mx-auto bg-gradient-to-r from-pink-500 to-purple-500 text-white text-3xl py-12 shadow-xl hover:scale-105 transition-transform"
                  onClick={handleRoll}
                  disabled={profile.coins < 10}
                >
                  {profile.coins >= 10 ? 'ガチャをひく!' : 'コインがたりない...'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  ひつよう: 🪙 10コイン
                </p>
              </>
            )}

            {isRolling && !showResult && (
              <div className="space-y-6">
                <div className="text-9xl animate-spin-slow">
                  ✨
                </div>
                <h2 className="text-4xl font-black animate-pulse">
                  ガチャちゅう...
                </h2>
              </div>
            )}

            {showResult && result && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-9xl animate-bounce">
                  {result.item.imageUrl || '🎁'}
                </div>
                <div className={`inline-block px-6 py-2 rounded-full text-xl font-bold ${getRarityColor(result.item.rarity)}`}>
                  {getRarityLabel(result.item.rarity)}
                </div>
                <h2 className="text-4xl font-black">
                  {result.item.name}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {result.item.description}
                </p>
                <div className="flex gap-4 justify-center">
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
                </div>
              </div>
            )}
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

        {/* アイテム一覧 */}
        {items && items.length > 0 && (
          <Card className="p-6 mt-6 bg-white/80">
            <h3 className="text-2xl font-bold mb-4">でてくるアイテム</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border-2 text-center ${getRarityColor(item.rarity)}`}
                >
                  <div className="text-4xl mb-2">{item.imageUrl || '🎁'}</div>
                  <div className="text-sm font-bold">{item.name}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
