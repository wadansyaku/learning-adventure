import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StoryDetail() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/story/:id");
  const chapterId = params?.id ? parseInt(params.id) : null;
  const [isReading, setIsReading] = useState(false);

  const { data: chapter, isLoading } = trpc.story.getById.useQuery(
    { id: chapterId! },
    { enabled: !!chapterId && isAuthenticated && user?.role === 'student' }
  );

  const { data: profile } = trpc.student.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const completeChapterMutation = trpc.story.complete.useMutation({
    onSuccess: (data) => {
      toast.success(`🎉 ${data.xpEarned} XP と ${data.coinsEarned} コインをゲット!`, {
        duration: 3000,
      });
      setTimeout(() => {
        setLocation('/story');
      }, 2000);
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">ストーリーがみつかりません</h2>
          <Button onClick={() => setLocation('/story')}>もどる</Button>
        </Card>
      </div>
    );
  }

  const isUnlocked = chapter.chapterNumber === 1 || (profile && profile.level >= chapter.requiredLevel);
  const isCompleted = chapter.isCompleted;

  const handleComplete = () => {
    if (!isCompleted && isUnlocked) {
      completeChapterMutation.mutate({ chapterId: chapter.id });
    }
  };

  // ストーリーテキストを段落に分割
  const paragraphs = chapter.storyText.split('\n\n').filter((p: string) => p.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/story')}
            className="text-lg"
          >
            ← もどる
          </Button>
          <div className="bg-white rounded-full px-4 py-2 shadow-md">
            <span className="text-sm text-muted-foreground">だい</span>
            <span className="ml-2 font-bold text-lg">{chapter.chapterNumber}しょう</span>
          </div>
        </div>

        {/* メインカード */}
        <Card className="p-6 sm:p-8 mb-6 bg-white/90 backdrop-blur shadow-2xl">
          {/* タイトル */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-primary mb-2">
              {chapter.title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>レベル {chapter.requiredLevel} いじょう</span>
              {isCompleted && <span className="text-green-600">✅ クリアずみ</span>}
            </div>
          </div>

          {/* ストーリー画像 */}
          {chapter.imageUrl && (
            <div className="mb-6">
              <img 
                src={chapter.imageUrl} 
                alt={chapter.title}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* ロック状態 */}
          {!isUnlocked ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-2">ロックされています</h3>
              <p className="text-muted-foreground">
                レベル {chapter.requiredLevel} になるとよめるよ!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (げんざいのレベル: {profile?.level || 1})
              </p>
            </div>
          ) : (
            <>
              {/* ストーリーテキスト */}
              <div className="prose prose-lg max-w-none mb-8">
                {!isReading ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📖</div>
                    <h3 className="text-2xl font-bold mb-4">ストーリーをよもう!</h3>
                    <Button 
                      size="lg"
                      onClick={() => setIsReading(true)}
                      className="text-xl px-8 py-6"
                    >
                      よみはじめる
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {paragraphs.map((paragraph: string, index: number) => (
                      <p 
                        key={index}
                        className="text-lg sm:text-xl leading-relaxed text-gray-800 animate-fade-in"
                        style={{ animationDelay: `${index * 0.3}s` }}
                      >
                        {paragraph}
                      </p>
                    ))}

                    {/* 宝物情報 */}
                    {chapter.treasures && chapter.treasures.length > 0 && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                        <h4 className="text-2xl font-bold mb-4 text-center">🎁 たからもの</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {chapter.treasures.map((treasure: any) => (
                            <div key={treasure.id} className="text-center">
                              <div className="text-4xl mb-2">{treasure.icon}</div>
                              <div className="font-bold text-sm">{treasure.name}</div>
                              <div className="text-xs text-muted-foreground">{treasure.rarity}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 完了ボタン */}
                    {!isCompleted && (
                      <div className="text-center mt-8">
                        <Button 
                          size="lg"
                          onClick={handleComplete}
                          disabled={completeChapterMutation.isPending}
                          className="text-xl px-8 py-6 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
                        >
                          {completeChapterMutation.isPending ? '...' : 'クリア!'}
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          ストーリーをクリアして、ほうしゅうをもらおう!
                        </p>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="text-center mt-8 p-6 bg-green-50 rounded-xl border-2 border-green-200">
                        <div className="text-5xl mb-2">🎉</div>
                        <h4 className="text-2xl font-bold text-green-600">クリアずみ!</h4>
                        <p className="text-muted-foreground">すばらしい!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        {/* ナビゲーション */}
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => {
              if (chapter.chapterNumber > 1) {
                setLocation(`/story/${chapter.id - 1}`);
              }
            }}
            disabled={chapter.chapterNumber === 1}
          >
            ← まえのしょう
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setLocation(`/story/${chapter.id + 1}`);
            }}
          >
            つぎのしょう →
          </Button>
        </div>
      </div>
    </div>
  );
}
