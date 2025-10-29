import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Tasks() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: tasks, isLoading } = trpc.task.getMyTasks.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'student' || user?.role === 'admin'),
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'admin'))) {
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

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/student')}
            className="text-lg"
          >
            ← もどる
          </Button>
          <h1 className="text-5xl font-black text-shadow">しゅくだい 📚</h1>
          <div className="w-24"></div> {/* スペーサー */}
        </div>

        {/* 未完了の宿題 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">やることリスト</h2>
          {pendingTasks.length === 0 ? (
            <Card className="p-8 text-center bg-white/90 backdrop-blur">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-2xl font-bold mb-2">しゅくだいはないよ!</h3>
              <p className="text-lg text-muted-foreground">すべてのしゅくだいをおわらせたね! すごい!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingTasks.map((task) => (
                <Card key={task.id} className="p-6 bg-white/90 backdrop-blur hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
                      <p className="text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="text-4xl">📝</div>
                  </div>
                  {task.dueDate && (
                    <p className="text-sm text-muted-foreground mb-4">
                      きげん: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                    </p>
                  )}
                  <Button 
                    className="w-full btn-fun bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    onClick={() => {
                      // 宿題の種類に応じてリダイレクト
                      if (task.taskType === 'app_problem') {
                        setLocation('/play');
                      } else {
                        setLocation('/student');
                      }
                    }}
                  >
                    しゅくだいをやる! 🚀
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 完了した宿題 */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-4">おわったしゅくだい</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedTasks.map((task) => (
                <Card key={task.id} className="p-6 bg-green-50/90 backdrop-blur">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
                      <p className="text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="text-4xl">✅</div>
                  </div>
                  {task.completedAt && (
                    <p className="text-sm text-green-600 font-semibold">
                      {new Date(task.completedAt).toLocaleDateString('ja-JP')} におわったよ!
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
