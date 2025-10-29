import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function BadgeCollection() {
  const { data: earnedBadges, isLoading } = trpc.badge.getMyBadges.useQuery();
  const { data: allBadges } = trpc.badge.getAllBadges.useQuery();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto"></div>
      </div>
    );
  }

  const earnedBadgeIds = new Set(earnedBadges?.map((b: any) => b.badgeId) || []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-primary mb-2">バッジコレクション</h2>
        <p className="text-lg text-muted-foreground">
          {earnedBadges?.length || 0} / {allBadges?.length || 0} バッジをゲット！
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allBadges?.map((badge: any) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          
          return (
            <Card 
              key={badge.id}
              className={`p-4 text-center transition-all duration-300 ${
                isEarned 
                  ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} border-4 ${getRarityBorder(badge.rarity)} shadow-lg hover:scale-105` 
                  : 'bg-gray-100 opacity-50 grayscale'
              }`}
            >
              <div className="text-6xl mb-2">{isEarned ? badge.icon : '🔒'}</div>
              <h3 className={`text-lg font-bold mb-1 ${isEarned ? 'text-white' : 'text-gray-600'}`}>
                {badge.name}
              </h3>
              <p className={`text-sm ${isEarned ? 'text-white/90' : 'text-gray-500'}`}>
                {badge.description}
              </p>
              {isEarned && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-bold bg-white/20 rounded-full text-white">
                    {badge.rarity === 'common' && 'コモン'}
                    {badge.rarity === 'rare' && 'レア'}
                    {badge.rarity === 'epic' && 'エピック'}
                    {badge.rarity === 'legendary' && 'レジェンド'}
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
