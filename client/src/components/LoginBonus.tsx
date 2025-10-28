import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LoginBonusProps {
  onClose: () => void;
}

export function LoginBonus({ onClose }: LoginBonusProps) {
  const [showBonus, setShowBonus] = useState(false);
  const [bonusData, setBonusData] = useState<any>(null);

  const checkLoginBonusMutation = trpc.student.checkLoginBonus.useMutation({
    onSuccess: (data) => {
      if (data.eligible) {
        setBonusData(data);
        setShowBonus(true);
      } else {
        onClose();
      }
    },
    onError: () => {
      onClose();
    },
  });

  const claimLoginBonusMutation = trpc.student.claimLoginBonus.useMutation({
    onSuccess: (data) => {
      toast.success(`ログインボーナス! ${data.coinsEarned}コイン と ${data.xpEarned}XP をゲット!`, {
        duration: 3000,
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    },
  });

  useEffect(() => {
    checkLoginBonusMutation.mutate();
  }, []);

  if (!showBonus || !bonusData) {
    return null;
  }

  const handleClaim = () => {
    claimLoginBonusMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-8 bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-400 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="text-9xl animate-bounce">
            🎁
          </div>
          
          <h2 className="text-4xl font-black">
            ログインボーナス!
          </h2>

          <div className="space-y-2">
            <div className="text-6xl font-black text-yellow-600">
              {bonusData.loginStreak}日目
            </div>
            <p className="text-xl text-muted-foreground">
              れんぞくログイン!
            </p>
          </div>

          <div className="bg-white/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl">🪙</span>
              <span className="text-3xl font-bold">+{bonusData.coinsEarned}</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl">⭐</span>
              <span className="text-3xl font-bold">+{bonusData.xpEarned} XP</span>
            </div>
          </div>

          {bonusData.loginStreak >= 7 && (
            <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl p-4">
              <p className="text-xl font-bold">
                🎉 7日連続ログイン達成! 🎉
              </p>
              <p className="text-sm text-muted-foreground">
                スペシャルボーナス!
              </p>
            </div>
          )}

          <Button
            className="btn-fun w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-2xl py-8"
            onClick={handleClaim}
            disabled={claimLoginBonusMutation.isPending}
          >
            {claimLoginBonusMutation.isPending ? 'もらっています...' : 'もらう!'}
          </Button>

          <p className="text-sm text-muted-foreground">
            まいにちログインしてボーナスをゲット!
          </p>
        </div>
      </Card>
    </div>
  );
}
