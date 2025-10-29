import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { OpenAIUsageStats } from "@/components/OpenAIUsageStats";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // 管理者はロール切り替え不要、直接各画面にアクセス

  useEffect(() => {
    console.log('[Home] Auth state:', { isAuthenticated, user, loading });
    if (isAuthenticated && user) {
      console.log('[Home] User authenticated, role:', user.role);
      // ロール別にリダイレクト
      if (user.role === 'student') {
        console.log('[Home] Redirecting to /student');
        setLocation('/student');
      } else if (user.role === 'teacher') {
        console.log('[Home] Redirecting to /teacher');
        setLocation('/teacher');
      } else if (user.role === 'parent') {
        console.log('[Home] Redirecting to /parent');
        setLocation('/parent');
      } else if (user.role === 'admin') {
        console.log('[Home] Admin user, staying on home page');
        // 管理者はホーム画面に留まる(リダイレクトしない)
      } else {
        console.log('[Home] Unknown role:', user.role);
      }
    }
  }, [isAuthenticated, user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  // 管理者画面
  if (isAuthenticated && user?.role === 'admin') {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">管理者ダッシュボード</h1>
            <div className="flex gap-4">
              <Button onClick={() => setLocation('/student')} className="gap-2">
                <span>🎓</span>
                生徒画面
              </Button>
              <Button onClick={() => setLocation('/teacher')} className="gap-2">
                <span>👨‍🏫</span>
                講師画面
              </Button>
              <Button onClick={() => setLocation('/parent')} className="gap-2">
                <span>👪</span>
                保護者画面
              </Button>
            </div>
          </div>

          <OpenAIUsageStats />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-2">🎓 生徒管理</h3>
              <p className="text-muted-foreground mb-4">生徒の登録、編集、削除</p>
              <Button onClick={() => setLocation('/student')} className="w-full">
                生徒画面へ
              </Button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-2">👨‍🏫 講師管理</h3>
              <p className="text-muted-foreground mb-4">課題作成、問題作成、進捗確認</p>
              <Button onClick={() => setLocation('/teacher')} className="w-full">
                講師画面へ
              </Button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-2">👪 保護者管理</h3>
              <p className="text-muted-foreground mb-4">子供の学習状況、統計データ</p>
              <Button onClick={() => setLocation('/parent')} className="w-full">
                保護者画面へ
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-black mb-6 text-shadow-lg bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
          ぼうけんがくしゅう
        </h1>
        <p className="text-2xl mb-8 text-foreground/80">
          どうぶつのなかまたちと<br />
          たのしくべんきょうしよう!
        </p>
        
        <div className="character-stage mb-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-8xl animate-bounce-slow">🐰</div>
          </div>
        </div>

        <div className="space-y-4">
          <a href={getLoginUrl()}>
            <Button className="btn-fun bg-primary text-primary-foreground hover:bg-primary/90 w-full max-w-xs">
              ログイン
            </Button>
          </a>
          <p className="text-sm text-muted-foreground">
            せんせいやおうちのひとといっしょに<br />
            ログインしてね
          </p>
        </div>
      </div>
    </div>
  );
}
