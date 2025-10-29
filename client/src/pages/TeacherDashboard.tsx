import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Users, FileText, PlusCircle, CheckCircle, Clock, BookOpen, MessageCircle } from "lucide-react";

export default function TeacherDashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: tasks } = trpc.task.getTeacherTasks.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'teacher',
  });

  const { data: students } = trpc.teacher.getAllStudents.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'teacher',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'teacher' && user?.role !== 'admin'))) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-slate-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
  const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* ヘッダー */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">講師ダッシュボード</h1>
                <p className="text-sm text-slate-500">ようこそ、{user?.name}先生</p>
              </div>
            </div>
            <div className="flex gap-2">
              <RoleSwitcher />
              <Button variant="outline" onClick={logout} size="sm">
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">生徒数</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{students?.length || 0}</div>
              <p className="text-sm text-slate-500 mt-1">担当生徒</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">総課題数</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{tasks?.length || 0}</div>
              <p className="text-sm text-slate-500 mt-1">作成済み課題</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">完了済み</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-sm text-slate-500 mt-1">完了した課題</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">未完了</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{pendingTasks}</div>
              <p className="text-sm text-slate-500 mt-1">進行中の課題</p>
            </CardContent>
          </Card>
        </div>

        {/* アクションカード */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-green-600" />
            クイックアクション
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle>課題を作成</CardTitle>
                <CardDescription>生徒に新しい課題を割り当てます</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setLocation('/teacher/create-task')}
                >
                  新規課題作成
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle>問題を作成</CardTitle>
                <CardDescription>アプリ内の問題を追加します</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setLocation('/teacher/create-problem')}
                >
                  新規問題作成
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle>会話履歴</CardTitle>
                <CardDescription>生徒の会話履歴を閲覧します</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setLocation('/teacher/conversations')}
                >
                  会話履歴を見る
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 課題一覧 */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <CardTitle>課題一覧</CardTitle>
            </div>
            <CardDescription>作成した課題の管理</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{task.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {task.status === 'completed' ? '完了' : '進行中'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                          {task.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">期限</p>
                      <p className="text-sm font-medium text-slate-900">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ja-JP') : '未設定'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">まだ課題がありません</p>
                <p className="text-sm text-slate-400 mt-1">新しい課題を作成してみましょう</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
