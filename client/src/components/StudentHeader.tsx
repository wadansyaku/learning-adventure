import { Coins, Gem, TrendingUp } from 'lucide-react';

interface StudentHeaderProps {
  level: number;
  xp: number;
  coins: number;
  gems: number;
  nextLevelXP?: number;
}

export default function StudentHeader({ level, xp, coins, gems, nextLevelXP = 100 }: StudentHeaderProps) {
  const xpPercentage = (xp / nextLevelXP) * 100;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Level */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-3 rounded-lg flex-1">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-full">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">レベル</p>
            <p className="text-2xl font-bold text-green-700">Lv.{level}</p>
          </div>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-3 rounded-lg flex-1">
          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-2 rounded-full">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">コイン</p>
            <p className="text-2xl font-bold text-yellow-700">{coins.toLocaleString()}</p>
          </div>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-violet-100 px-4 py-3 rounded-lg flex-1">
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-2 rounded-full">
            <Gem className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">ジェム</p>
            <p className="text-2xl font-bold text-purple-700">{gems.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-600 font-medium">つぎのレベルまで</p>
          <p className="text-sm font-bold text-gray-700">
            {xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(xpPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
