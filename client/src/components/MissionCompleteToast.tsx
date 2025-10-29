import { useEffect, useState } from "react";
import { Trophy, Sparkles, Coins, Gem } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MissionCompleteToastProps {
  missionTitle: string;
  rewards: {
    xp?: number;
    coins?: number;
    gems?: number;
  };
  onClose: () => void;
}

export function MissionCompleteToast({ missionTitle, rewards, onClose }: MissionCompleteToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 border-4 border-yellow-400 shadow-2xl p-6 min-w-[400px] animate-bounce-in">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <Trophy className="w-16 h-16 text-yellow-300 animate-bounce" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-white animate-spin-slow" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-black text-white">ミッションクリア!</h3>
              <span className="text-3xl animate-pulse">🎉</span>
            </div>
            
            <p className="text-lg font-bold text-yellow-100 mb-3">{missionTitle}</p>

            {/* Rewards */}
            <div className="flex gap-3">
              {rewards.xp && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-white font-bold">+{rewards.xp} XP</span>
                </div>
              )}
              
              {rewards.coins && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-300" />
                  <span className="text-white font-bold">+{rewards.coins}</span>
                </div>
              )}
              
              {rewards.gems && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                  <Gem className="w-5 h-5 text-pink-300" />
                  <span className="text-white font-bold">+{rewards.gems}</span>
                </div>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-300 animate-progress" />
        </div>
      </Card>

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3) translateX(100%);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateX(0);
          }
          70% {
            transform: scale(0.9) translateX(0);
          }
          100% {
            transform: scale(1) translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
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
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-progress {
          animation: progress 5s linear;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
