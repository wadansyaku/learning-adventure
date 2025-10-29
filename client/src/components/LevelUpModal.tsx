import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Sparkles, Trophy, Star, Zap } from "lucide-react";

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Delay to allow animation
    setTimeout(() => setShow(true), 100);
    
    // Generate confetti
    const confettiArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));
    setConfetti(confettiArray);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {/* Confetti background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute top-0 w-2 h-2 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full animate-fall"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Radial light rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-gradient-radial from-yellow-400/30 via-transparent to-transparent animate-pulse" />
      </div>

      <Card className={`relative max-w-2xl w-full p-16 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-8 border-yellow-400 shadow-2xl transform transition-all duration-700 ${show ? 'scale-100 rotate-0' : 'scale-50 rotate-12'}`}>
        <div className="text-center space-y-8">
          {/* Floating icons */}
          <div className="relative h-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              <Trophy className="w-32 h-32 text-yellow-500 animate-bounce drop-shadow-2xl" />
            </div>
            <Sparkles className="absolute top-4 left-8 w-12 h-12 text-purple-500 animate-spin-slow" />
            <Sparkles className="absolute top-4 right-8 w-12 h-12 text-pink-500 animate-spin-slow animation-delay-500" />
            <Star className="absolute bottom-0 left-16 w-8 h-8 text-yellow-400 animate-ping" />
            <Star className="absolute bottom-0 right-16 w-8 h-8 text-orange-400 animate-ping animation-delay-300" />
            <Zap className="absolute top-12 left-24 w-10 h-10 text-blue-500 animate-pulse" />
            <Zap className="absolute top-12 right-24 w-10 h-10 text-purple-500 animate-pulse animation-delay-200" />
          </div>
          
          <div className="space-y-6">
            {/* Main title with gradient and animation */}
            <div className="relative">
              <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 animate-gradient-x">
                レベルアップ!
              </h2>
              <div className="absolute inset-0 text-8xl font-black text-yellow-400/20 blur-xl animate-pulse">
                レベルアップ!
              </div>
            </div>
            
            {/* Level display with glow effect */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-3xl p-10 shadow-2xl border-4 border-yellow-300 transform hover:scale-105 transition-transform">
                <div className="relative">
                  <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 mb-2 animate-pulse">
                    Lv.{newLevel}
                  </div>
                  <div className="absolute inset-0 text-9xl font-black text-yellow-400/30 blur-2xl">
                    Lv.{newLevel}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-700">
                  になったよ! 🎊
                </p>
              </div>
            </div>

            {/* Rewards section */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-500 animate-spin-slow" />
                <p className="text-4xl font-black text-purple-600">ごほうび</p>
                <Sparkles className="w-8 h-8 text-pink-500 animate-spin-slow" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Coins reward */}
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-xl transform hover:scale-110 transition-all">
                  <div className="text-5xl mb-2">🪙</div>
                  <div className="text-3xl font-black text-white">+{newLevel * 10}</div>
                  <p className="text-sm text-yellow-100 font-bold">コイン</p>
                </div>
                
                {/* Gems reward */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 shadow-xl transform hover:scale-110 transition-all">
                  <div className="text-5xl mb-2">💎</div>
                  <div className="text-3xl font-black text-white">+{Math.floor(newLevel / 5)}</div>
                  <p className="text-sm text-pink-100 font-bold">ジェム</p>
                </div>
                
                {/* XP boost */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl transform hover:scale-110 transition-all">
                  <div className="text-5xl mb-2">⚡</div>
                  <div className="text-3xl font-black text-white">+10%</div>
                  <p className="text-sm text-blue-100 font-bold">XPブースト</p>
                </div>
              </div>
            </div>
          </div>

          {/* Close button with animation */}
          <Button
            className="w-full h-20 text-4xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white shadow-2xl transform hover:scale-105 transition-all animate-pulse-slow"
            onClick={handleClose}
          >
            <span className="flex items-center justify-center gap-3">
              やったー! 
              <Trophy className="w-10 h-10" />
              🎉
            </span>
          </Button>

          <p className="text-2xl font-bold text-gray-600 animate-bounce">
            もっとがんばろう! ✨
          </p>
        </div>
      </Card>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-fall {
          animation: fall linear infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
