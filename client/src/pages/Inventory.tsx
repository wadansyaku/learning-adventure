import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Inventory() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'rarity' | 'name' | 'date'>('rarity');

  const { data: profile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  const { data: myItems, refetch: refetchItems } = trpc.gacha.getMyItems.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  const { data: characters } = trpc.character.getMy.useQuery(undefined, {
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
        return 'border-gray-400 bg-gray-50';
      case 'uncommon':
        return 'border-green-400 bg-green-50';
      case 'rare':
        return 'border-blue-400 bg-blue-50';
      case 'epic':
        return 'border-purple-400 bg-purple-50';
      case 'legendary':
        return 'border-yellow-400 bg-yellow-50';
      default:
        return 'border-gray-400 bg-gray-50';
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
  let unequippedItems = myItems?.filter((item: any) => !item.isEquipped) || [];
  
  // ソート機能
  if (sortBy === 'rarity') {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    unequippedItems = unequippedItems.sort((a: any, b: any) => 
      (rarityOrder[a.rarity as keyof typeof rarityOrder] || 5) - (rarityOrder[b.rarity as keyof typeof rarityOrder] || 5)
    );
  } else if (sortBy === 'name') {
    unequippedItems = unequippedItems.sort((a: any, b: any) => a.name.localeCompare(b.name));
  } else if (sortBy === 'date') {
    unequippedItems = unequippedItems.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="container max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/student')}
            className="hover:scale-105 transition-transform"
          >
            ← もどる
          </Button>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">もちもの</h1>
          <div className="w-24"></div> {/* スペーサー */}
        </div>

        {/* プレビューエリア */}
        {characters && characters.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-4 border-purple-200 shadow-xl">
              <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">プレビュー</h2>
              <div className="flex justify-center items-center">
                <div className="relative">
                  <motion.img 
                    key={previewItem?.id || 'default'}
                    src={characters[0].imageUrl} 
                    alt={characters[0].name}
                    className="w-80 h-80 object-contain"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  />
                  {/* プレビューアイテムまたは装備中のアイテムを表示 */}
                  <AnimatePresence mode="wait">
                    {(previewItem || equippedItems[0]) && (
                      <motion.img 
                        key={previewItem?.id || equippedItems[0]?.id}
                        src={previewItem?.imageUrl || equippedItems[0]?.imageUrl}
                        alt="プレビュー"
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-40 h-40 object-contain drop-shadow-2xl"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {previewItem && (
                <motion.p 
                  className="text-center mt-4 text-2xl font-bold text-purple-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {previewItem.name} をプレビュー中 ✨
                </motion.p>
              )}
            </Card>
          </motion.div>
        )}

        {/* 装備中のアイテム */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
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
                  className={`p-4 cursor-pointer hover:shadow-xl hover:scale-105 transition-all border-4 ${getRarityColor(item.rarity)} relative`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
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
                  <p className="text-sm text-center font-semibold" style={{
                    color: item.rarity === 'legendary' ? '#ca8a04' :
                           item.rarity === 'epic' ? '#9333ea' :
                           item.rarity === 'rare' ? '#2563eb' :
                           item.rarity === 'uncommon' ? '#16a34a' : '#6b7280'
                  }}>
                    {getRarityLabel(item.rarity)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 所持アイテム */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <span>🎒</span>
              <span>もっているアイテム</span>
            </h2>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'rarity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rarity')}
                className="hover:scale-105 transition-transform"
              >
                レア度
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
                className="hover:scale-105 transition-transform"
              >
                名前
              </Button>
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('date')}
                className="hover:scale-105 transition-transform"
              >
                日付
              </Button>
            </div>
          </div>
          {unequippedItems.length === 0 ? (
            <Card className="p-8 text-center bg-white/80">
              <p className="text-xl text-muted-foreground">アイテムをもっていないよ</p>
              <p className="text-lg text-muted-foreground mt-2">ガチャでゲットしよう!</p>
              <Button
                className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 transition-transform"
                onClick={() => setLocation('/gacha')}
              >
                ガチャにいく →
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unequippedItems.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onHoverStart={() => setPreviewItem(item)}
                  onHoverEnd={() => setPreviewItem(null)}
                  onTouchStart={() => setPreviewItem(item)}
                  onTouchEnd={() => setTimeout(() => setPreviewItem(null), 1000)}
                >
                  <Card
                    className={`p-4 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border-4 ${getRarityColor(item.rarity)}`}
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
                    <p className="text-sm text-center font-semibold" style={{
                      color: item.rarity === 'legendary' ? '#ca8a04' :
                             item.rarity === 'epic' ? '#9333ea' :
                             item.rarity === 'rare' ? '#2563eb' :
                             item.rarity === 'uncommon' ? '#16a34a' : '#6b7280'
                    }}>
                      {getRarityLabel(item.rarity)}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* アイテム詳細モーダル */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedItem(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.5, rotateY: 90 }}
                animate={{ scale: 1, rotateY: 0 }}
                exit={{ scale: 0.5, rotateY: -90 }}
                transition={{ type: "spring", stiffness: 200 }}
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
                  <p className="text-center text-xl font-bold mb-4" style={{
                    color: selectedItem.rarity === 'legendary' ? '#ca8a04' :
                           selectedItem.rarity === 'epic' ? '#9333ea' :
                           selectedItem.rarity === 'rare' ? '#2563eb' :
                           selectedItem.rarity === 'uncommon' ? '#16a34a' : '#6b7280'
                  }}>
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
