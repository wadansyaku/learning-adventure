import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay to allow animation
    setTimeout(() => setShow(true), 100);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`max-w-lg w-full p-12 bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 border-8 border-yellow-400 shadow-2xl transform transition-all duration-500 ${show ? 'scale-100 rotate-0' : 'scale-50 rotate-12'}`}>
        <div className="text-center space-y-8">
          {/* 花火エフェクト */}
          <div className="relative">
            <div className="text-9xl animate-bounce">
              🎊
            </div>
            <div className="absolute top-0 left-1/4 text-6xl animate-ping">✨</div>
            <div className="absolute top-0 right-1/4 text-6xl animate-ping animation-delay-200">✨</div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse">
              レベルアップ!
            </h2>
            
            <div className="bg-white/80 rounded-3xl p-8 shadow-inner">
              <div className="text-8xl font-black text-yellow-600 mb-2">
                Lv.{newLevel}
              </div>
              <p className="text-2xl text-muted-foreground">
                になったよ!
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-3xl font-bold">🎁 ごほうび</p>
              <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-4xl">🪙</span>
                  <span className="text-3xl font-bold">+{newLevel * 10}</span>
                </div>
                <p className="text-sm text-muted-foreground">レベルアップボーナス!</p>
              </div>
            </div>
          </div>

          <Button
            className="w-full h-16 text-3xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white shadow-2xl transform hover:scale-105 transition-all"
            onClick={handleClose}
          >
            やったー! 🎉
          </Button>

          <p className="text-xl text-muted-foreground">
            もっとがんばろう!
          </p>
        </div>
      </Card>
    </div>
  );
}
