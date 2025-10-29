import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { OpenAIUsageStats } from "@/components/OpenAIUsageStats";
import { Users, GraduationCap, UserCircle, BarChart3, Settings, TrendingUp } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-slate-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 管理者画面
  if (isAuthenticated && user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
        {/* ヘッダー */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">管理者ダッシュボード</h1>
                  <p className="text-sm text-slate-500">Learning Adventure 管理コンソール</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setLocation('/student')} variant="outline" size="sm" className="gap-2">
                  <GraduationCap className="w-4 h-4" />
                  生徒画面
                </Button>
                <Button onClick={() => setLocation('/teacher')} variant="outline" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  講師画面
                </Button>
                <Button onClick={() => setLocation('/parent')} variant="outline" size="sm" className="gap-2">
                  <UserCircle className="w-4 h-4" />
                  保護者画面
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* OpenAI使用状況 */}
          <OpenAIUsageStats />

          {/* 管理メニュー */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              システム管理
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 生徒管理 */}
              <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">生徒管理</CardTitle>
                  <CardDescription>生徒の登録、編集、削除</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setLocation('/student')} className="w-full bg-blue-600 hover:bg-blue-700">
                    生徒画面へ
                  </Button>
                </CardContent>
              </Card>

              {/* 講師管理 */}
              <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">講師管理</CardTitle>
                  <CardDescription>課題作成、問題作成、進捗確認</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setLocation('/teacher')} className="w-full bg-green-600 hover:bg-green-700">
                    講師画面へ
                  </Button>
                </CardContent>
              </Card>

              {/* 保護者管理 */}
              <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                    <UserCircle className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">保護者管理</CardTitle>
                  <CardDescription>子供の学習状況、統計データ</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setLocation('/parent')} className="w-full bg-purple-600 hover:bg-purple-700">
                    保護者画面へ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              クイックアクション
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">課題作成</CardTitle>
                  <CardDescription>新しい課題を作成</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setLocation('/create-task')} variant="outline" className="w-full">
                    課題作成画面へ
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">問題作成</CardTitle>
                  <CardDescription>新しい問題を作成</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setLocation('/create-problem')} variant="outline" className="w-full">
                    問題作成画面へ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ランディングページ（未認証ユーザー）
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 mb-8">
              <span className="text-2xl">🎓</span>
              <span className="text-sm font-medium text-purple-700">楽しく学べる学習プラットフォーム</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Learning Adventure
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              子どもたちの学びを冒険に変える。<br />
              キャラクターと一緒に、楽しく成長しよう。
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8"
                onClick={() => window.location.href = getLoginUrl()}
              >
                ログイン / はじめる
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 機能紹介 */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">主な機能</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-4xl">🎮</span>
              </div>
              <CardTitle>楽しい問題</CardTitle>
              <CardDescription>
                ゲーム感覚で学べる問題で、楽しく学力アップ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-4xl">🐰</span>
              </div>
              <CardTitle>かわいい仲間</CardTitle>
              <CardDescription>
                キャラクターと一緒に冒険しながら成長
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <CardTitle>学習管理</CardTitle>
              <CardDescription>
                保護者・講師が学習状況をリアルタイムで確認
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
