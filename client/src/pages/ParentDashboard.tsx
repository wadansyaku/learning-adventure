import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function ParentDashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'parent' && user?.role !== 'admin'))) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black">保護者ダッシュボード</h1>
            <p className="text-xl text-muted-foreground">ようこそ、{user?.name}さん</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>

        {/* お知らせ */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <h3 className="text-xl font-bold mb-2">🎉 保護者機能は近日公開予定です</h3>
          <p className="text-muted-foreground">
            お子様の学習状況、進捗レポート、講師とのコミュニケーション機能などを準備中です。
          </p>
        </Card>

        {/* プレースホルダー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">学習状況</h3>
            <p className="text-muted-foreground mb-4">お子様の学習時間や達成状況を確認できます</p>
            <div className="text-center py-8 text-muted-foreground">
              準備中...
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">進捗レポート</h3>
            <p className="text-muted-foreground mb-4">週次・月次の学習レポートを閲覧できます</p>
            <div className="text-center py-8 text-muted-foreground">
              準備中...
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">講師との連絡</h3>
            <p className="text-muted-foreground mb-4">講師とメッセージのやり取りができます</p>
            <div className="text-center py-8 text-muted-foreground">
              準備中...
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">設定</h3>
            <p className="text-muted-foreground mb-4">学習時間の制限などを設定できます</p>
            <div className="text-center py-8 text-muted-foreground">
              準備中...
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
