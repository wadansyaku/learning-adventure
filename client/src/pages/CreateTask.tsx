import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateTask() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [taskType, setTaskType] = useState<"school_homework" | "app_problem">("school_homework");
  const [xpReward, setXpReward] = useState(10);
  const [coinReward, setCoinReward] = useState(5);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const { data: students } = trpc.teacher.getAllStudents.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === 'teacher' || user?.role === 'admin'),
  });

  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      toast.success('課題を作成しました!');
      setLocation('/teacher');
    },
    onError: (error) => {
      toast.error(`課題の作成に失敗しました: ${error.message}`);
    },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    
    if (!selectedStudentId) {
      toast.error('生徒を選択してください');
      return;
    }

    createTaskMutation.mutate({
      studentId: selectedStudentId,
      title,
      taskType,
      description: description || undefined,
      difficulty,
      xpReward,
      coinReward,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">課題作成</h1>
          <Button variant="outline" onClick={() => setLocation('/teacher')}>
            ← 戻る
          </Button>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 生徒選択 */}
            <div className="space-y-2">
              <Label htmlFor="student">生徒を選択 *</Label>
              <Select
                value={selectedStudentId?.toString() || ""}
                onValueChange={(value) => setSelectedStudentId(parseInt(value))}
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="生徒を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student: any) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.displayName} (Level {student.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* タイトル */}
            <div className="space-y-2">
              <Label htmlFor="title">課題タイトル *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 算数プリント1ページ"
                required
              />
            </div>

            {/* 説明 */}
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="課題の詳細を入力してください"
                rows={4}
              />
            </div>

            {/* 課題タイプ */}
            <div className="space-y-2">
              <Label htmlFor="taskType">課題タイプ</Label>
              <Select
                value={taskType}
                onValueChange={(value: "school_homework" | "app_problem") => setTaskType(value)}
              >
                <SelectTrigger id="taskType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school_homework">学校の宿題</SelectItem>
                  <SelectItem value="app_problem">アプリ内の問題</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 難易度 */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">難易度</Label>
              <Select
                value={difficulty}
                onValueChange={(value: "easy" | "medium" | "hard") => {
                  setDifficulty(value);
                  // 難易度に応じて報酬を自動調整
                  if (value === 'easy') {
                    setXpReward(10);
                    setCoinReward(5);
                  } else if (value === 'medium') {
                    setXpReward(20);
                    setCoinReward(10);
                  } else {
                    setXpReward(30);
                    setCoinReward(15);
                  }
                }}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">簡単</SelectItem>
                  <SelectItem value="medium">普通</SelectItem>
                  <SelectItem value="hard">難しい</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 報酬設定 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xpReward">XP報酬</Label>
                <Input
                  id="xpReward"
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                  min={1}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coinReward">コイン報酬</Label>
                <Input
                  id="coinReward"
                  type="number"
                  value={coinReward}
                  onChange={(e) => setCoinReward(parseInt(e.target.value) || 0)}
                  min={1}
                  max={50}
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/teacher')}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="flex-1 bg-primary text-primary-foreground"
              >
                {createTaskMutation.isPending ? '作成中...' : '課題を作成'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
