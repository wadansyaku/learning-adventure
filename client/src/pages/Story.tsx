import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Story() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const { data: chapters, isLoading: chaptersLoading } = trpc.story.getChapters.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const { data: progress } = trpc.story.getMyProgress.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const { data: profile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const completeChapterMutation = trpc.story.complete.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.xpEarned} XP と ${data.coinsEarned} コインをゲット!`, {
        duration: 3000,
      });
      setSelectedChapter(null);
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || chaptersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  const isChapterCompleted = (chapterId: number) => {
    return progress?.some((p: any) => p.chapterId === chapterId && p.isCompleted);
  };

  const isChapterUnlocked = (chapter: any) => {
    return profile && profile.level >= chapter.requiredLevel;
  };

  const handleCompleteChapter = (chapterId: number) => {
    completeChapterMutation.mutate({ chapterId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/student')}
            className="text-lg"
          >
            ← もどる
          </Button>
          <h1 className="text-4xl font-black">ぼうけんのたび 🗺️</h1>
          <div className="w-20"></div>
        </div>

        {/* チャプター一覧 */}
        {!selectedChapter ? (
          <div className="space-y-6">
            {chapters && chapters.length > 0 ? (
              chapters.map((chapter: any) => {
                const completed = isChapterCompleted(chapter.id);
                const unlocked = isChapterUnlocked(chapter);

                return (
                  <Card 
                    key={chapter.id}
                    className={`p-6 transform transition-all hover:scale-102 cursor-pointer ${
                      completed ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400' :
                      unlocked ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-400 hover:shadow-xl' :
                      'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => unlocked && setLocation(`/story/${chapter.id}`)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-6xl">
                        {completed ? '✅' : unlocked ? '📖' : '🔒'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold bg-purple-600 text-white px-3 py-1 rounded-full">
                            だい{chapter.chapterNumber}しょう
                          </span>
                          {!unlocked && (
                            <span className="text-sm bg-gray-600 text-white px-3 py-1 rounded-full">
                              Lv.{chapter.requiredLevel}でかいじょ
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{chapter.title}</h3>
                        <p className="text-muted-foreground mb-3">{chapter.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="text-xl">⭐</span>
                            <span className="font-bold">+{chapter.xpReward} XP</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-xl">🪙</span>
                            <span className="font-bold">+{chapter.coinReward}</span>
                          </span>
                        </div>
                      </div>
                      {completed && (
                        <div className="text-center">
                          <div className="text-3xl mb-1">🏆</div>
                          <p className="text-xs text-green-600 font-bold">クリア!</p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold mb-2">ストーリーはまだないよ</h3>
                <p className="text-muted-foreground">もうすぐたのしいぼうけんがはじまるよ!</p>
              </Card>
            )}
          </div>
        ) : (
          /* チャプター詳細 */
          <Card className="p-8 bg-gradient-to-br from-blue-100 to-purple-100">
            <Button 
              variant="outline" 
              onClick={() => setSelectedChapter(null)}
              className="mb-6"
            >
              ← もどる
            </Button>

            <div className="text-center space-y-6">
              <div className="text-sm font-bold bg-purple-600 text-white px-4 py-2 rounded-full inline-block">
                だい{selectedChapter.chapterNumber}しょう
              </div>
              
              <h2 className="text-4xl font-black">{selectedChapter.title}</h2>
              
              {selectedChapter.imageUrl && (
                <img 
                  src={selectedChapter.imageUrl} 
                  alt={selectedChapter.title}
                  className="mx-auto max-w-md rounded-2xl shadow-2xl"
                />
              )}

              <p className="text-xl leading-relaxed max-w-2xl mx-auto">
                {selectedChapter.description}
              </p>

              <div className="bg-white/80 rounded-2xl p-6 max-w-md mx-auto">
                <p className="text-lg font-bold mb-4">クリアほうしゅう</p>
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">⭐</span>
                    <span className="text-2xl font-bold">+{selectedChapter.xpReward}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🪙</span>
                    <span className="text-2xl font-bold">+{selectedChapter.coinReward}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleCompleteChapter(selectedChapter.id)}
                disabled={completeChapterMutation.isPending}
                className="w-full max-w-md h-16 text-2xl font-black bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-2xl"
              >
                {completeChapterMutation.isPending ? 'クリアちゅう...' : 'クリア! 🎉'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
