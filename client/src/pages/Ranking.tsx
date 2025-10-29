import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Card } from '../components/ui/card';
import { Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-react';

export default function Ranking() {
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly'>('global');
  
  const { data: globalRanking, isLoading: globalLoading } = trpc.ranking.getGlobalRanking.useQuery({ limit: 100 });
  const { data: weeklyRanking, isLoading: weeklyLoading } = trpc.ranking.getWeeklyRanking.useQuery({ limit: 100 });
  const { data: monthlyRanking, isLoading: monthlyLoading } = trpc.ranking.getMonthlyRanking.useQuery({ limit: 100 });
  const { data: myRank } = trpc.ranking.getMyRank.useQuery();

  const getCurrentRanking = () => {
    switch (activeTab) {
      case 'global': return globalRanking || [];
      case 'weekly': return weeklyRanking || [];
      case 'monthly': return monthlyRanking || [];
    }
  };

  const isLoading = globalLoading || weeklyLoading || monthlyLoading;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Award className="w-8 h-8 text-amber-600" />;
    return <Trophy className="w-6 h-6 text-gray-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-500 to-amber-700';
    return 'from-blue-400 to-blue-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Home Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.location.href = '/student'}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-gray-700">ホームにもどる</span>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🏆 ランキング 🏆
            </h1>
            <p className="text-xl text-gray-700">
              みんなとせいせきをくらべよう！
            </p>
          </div>
          <div className="w-40"></div>
        </div>

        {/* My Rank Card */}
        {myRank && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">あなたのじゅんい</p>
                <p className="text-4xl font-bold">{myRank.globalRank}い</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">ぜんたい</p>
                <p className="text-2xl font-bold">{myRank.totalStudents}にん</p>
              </div>
              <TrendingUp className="w-16 h-16 opacity-50" />
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === 'global'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            そうごう
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === 'weekly'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            しゅうかん
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
              activeTab === 'monthly'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
げっかん
          </button>
        </div>

        {/* Ranking List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-700">よみこみちゅう...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getCurrentRanking().map((student: any, index: number) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              
              return (
                <Card
                  key={student.studentId}
                  className={`p-4 transition-all hover:scale-105 ${
                    isTop3
                      ? `bg-gradient-to-r ${getRankColor(rank)} text-white shadow-xl`
                      : 'bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-16 text-center">
                      {getRankIcon(rank)}
                      <p className={`text-2xl font-bold ${isTop3 ? 'text-white' : 'text-gray-700'}`}>
                        {rank}
                      </p>
                    </div>

                    {/* Avatar */}
                    <div className="text-5xl">
                      {student.avatarIcon || '🐰'}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className={`text-xl font-bold ${isTop3 ? 'text-white' : 'text-gray-900'}`}>
                        {student.displayName}
                      </p>
                      <div className="flex gap-4 mt-1">
                        {activeTab === 'global' && (
                          <>
                            <p className={`text-sm ${isTop3 ? 'text-white/90' : 'text-gray-600'}`}>
                              レベル {student.level}
                            </p>
                            <p className={`text-sm ${isTop3 ? 'text-white/90' : 'text-gray-600'}`}>
                              XP {student.xp.toLocaleString()}
                            </p>
                          </>
                        )}
                        {activeTab === 'weekly' && (
                          <p className={`text-sm ${isTop3 ? 'text-white/90' : 'text-gray-600'}`}>
げっかんXP {student.monthlyXP.toLocaleString()}
                          </p>
                        )}
                        {activeTab === 'monthly' && (
                          <p className={`text-sm ${isTop3 ? 'text-white/90' : 'text-gray-600'}`}>
                げっかんXP {student.monthlyXP.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    {activeTab === 'global' && (
                      <div className="text-right">
                        <p className={`text-sm ${isTop3 ? 'text-white/90' : 'text-gray-600'}`}>
                          💰 {student.coins.toLocaleString()}
                        </p>
                        <p className={`text-sm ${isTop3 ? 'text-white/90' : 'text-gray-600'}`}>
                          💎 {student.gems.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {getCurrentRanking().length === 0 && !isLoading && (
          <Card className="p-12 text-center bg-white">
            <p className="text-2xl text-gray-500">まだデータがありません</p>
          </Card>
        )}
      </div>
    </div>
  );
}
