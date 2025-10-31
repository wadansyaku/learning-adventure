import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Inventory() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: profile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  const { data: myItems, refetch: refetchItems } = trpc.gacha.getMyItems.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  const equipItemMutation = trpc.gacha.equipItem.useMutation({
    onSuccess: () => {
      // toast.success('帽子を装備したよ!');
      refetchItems();
      setSelectedItem(null);
    },
    onError: (error: any) => {
      // toast.error(error.message);
      console.error('Failed to equip item:', error);
    },
  });

  const unequipItemMutation = trpc.gacha.unequipItem.useMutation({
    onSuccess: () => {
      // toast.success('帽子をはずしたよ!');
      refetchItems();
      setSelectedItem(null);
    },
    onError: (error: any) => {
      // toast.error(error.message);
      console.error('Failed to unequip item:', error);
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    } else if (!authLoading && isAuthenticated && user?.role !== 'student' && user?.role !== 'admin') {
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50';
      case 'uncommon':
        return 'border-green-300 bg-green-50';
      case 'rare':
        return 'border-blue-300 bg-blue-50';
      case 'epic':
        return 'border-purple-300 bg-purple-50';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'ノーマル';
      case 'uncommon':
        return 'アンコモン';
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

  const equippedItems = myItems?.filter((item: any) => item.isEquipped) || [];
  const unequippedItems = myItems?.filter((item: any) => !item.isEquipped) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="container max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => setLocation('/student')}>
            ← もどる
          </Button>
          <h1 className="text-4xl font-black">もちもの</h1>
          <div className="w-24"></div> {/* スペーサー */}
        </div>

        {/* 装備中のアイテム */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>✨</span>
            <span>そうびちゅう</span>
          </h2>
          {equippedItems.length === 0 ? (
            <Card className="p-8 text-center bg-white/80">
              <p className="text-xl text-muted-foreground">そうびしているアイテムはないよ</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {equippedItems.map((item: any) => (
                <Card
                  key={item.id}
                  className={`p-4 cursor-pointer hover:shadow-xl transition-all border-4 ${getRarityColor(item.rarity)} relative`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    そうびちゅう
                  </div>
                  <div className="flex justify-center items-center h-32 mb-2">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-6xl">🎩</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-center mb-1">{item.name}</h3>
                  <p className="text-xs text-center text-muted-foreground">{getRarityLabel(item.rarity)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 所持アイテム */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🎒</span>
            <span>もっているアイテム</span>
          </h2>
          {unequippedItems.length === 0 ? (
            <Card className="p-8 text-center bg-white/80">
              <p className="text-xl text-muted-foreground">アイテムをもっていないよ</p>
              <p className="text-lg text-muted-foreground mt-2">ガチャでゲットしよう!</p>
              <Button
                className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                onClick={() => setLocation('/gacha')}
              >
                ガチャにいく →
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unequippedItems.map((item: any) => (
                <Card
                  key={item.id}
                  className={`p-4 cursor-pointer hover:shadow-xl transition-all border-4 ${getRarityColor(item.rarity)}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex justify-center items-center h-32 mb-2">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-6xl">🎩</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-center mb-1">{item.name}</h3>
                  <p className="text-xs text-center text-muted-foreground">{getRarityLabel(item.rarity)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* アイテム詳細モーダル */}
        {selectedItem && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <Card
              className={`max-w-md w-full p-6 border-4 ${getRarityColor(selectedItem.rarity)}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center items-center h-48 mb-4">
                {selectedItem.imageUrl ? (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-9xl">🎩</span>
                )}
              </div>
              <h2 className="text-3xl font-black text-center mb-2">{selectedItem.name}</h2>
              <p className="text-center text-lg text-muted-foreground mb-4">
                {getRarityLabel(selectedItem.rarity)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedItem(null)}
                >
                  とじる
                </Button>
                {selectedItem.isEquipped ? (
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => unequipItemMutation.mutate({ studentItemId: selectedItem.id })}
                    disabled={unequipItemMutation.isPending}
                  >
                    はずす
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    onClick={() => equipItemMutation.mutate({ studentItemId: selectedItem.id })}
                    disabled={equipItemMutation.isPending}
                  >
                    そうびする
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
