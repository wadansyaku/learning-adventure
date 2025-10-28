import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      // ロール別にリダイレクト
      if (user.role === 'student') {
        setLocation('/student');
      } else if (user.role === 'teacher') {
        setLocation('/teacher');
      } else if (user.role === 'parent') {
        setLocation('/parent');
      }
    }
  }, [isAuthenticated, user, setLocation]);

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
