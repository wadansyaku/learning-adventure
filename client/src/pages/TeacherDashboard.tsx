import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function TeacherDashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: tasks } = trpc.task.getTeacherTasks.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'teacher' || user?.role === 'admin'),
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'teacher' && user?.role !== 'admin'))) {
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
            <h1 className="text-4xl font-black">講師ダッシュボード</h1>
            <p className="text-xl text-muted-foreground">ようこそ、{user?.name}先生</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">総課題数</h3>
            <p className="text-4xl font-black text-primary">{tasks?.length || 0}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">完了済み</h3>
            <p className="text-4xl font-black text-green-600">
              {tasks?.filter(t => t.status === 'completed').length || 0}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">未完了</h3>
            <p className="text-4xl font-black text-orange-600">
              {tasks?.filter(t => t.status === 'pending').length || 0}
            </p>
          </Card>
        </div>

        {/* アクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">課題を作成</h3>
            <p className="mb-4 text-muted-foreground">生徒に新しい課題を割り当てます</p>
            <Button className="w-full bg-primary text-primary-foreground">
              新規課題作成
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">問題を作成</h3>
            <p className="mb-4 text-muted-foreground">アプリ内の問題を追加します</p>
            <Button className="w-full bg-secondary text-secondary-foreground">
              新規問題作成
            </Button>
          </Card>
        </div>

        {/* 課題一覧 */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">課題一覧</h3>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.slice(0, 10).map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 bg-muted rounded-xl"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? '完了' :
                         task.status === 'in_progress' ? '進行中' : '未着手'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {task.difficulty === 'easy' ? '簡単' :
                         task.difficulty === 'medium' ? '普通' : '難しい'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">報酬</div>
                    <div className="font-bold">{task.xpReward} XP</div>
                    <div className="font-bold text-yellow-600">{task.coinReward} コイン</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              まだ課題がありません
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
