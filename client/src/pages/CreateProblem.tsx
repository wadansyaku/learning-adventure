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

export default function CreateProblem() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const [problemType, setProblemType] = useState<"addition" | "subtraction" | "comparison" | "pattern" | "shape">("addition");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [options, setOptions] = useState("");
  const [xpReward, setXpReward] = useState(5);
  const [coinReward, setCoinReward] = useState(2);

  const createProblemMutation = trpc.problem.create.useMutation({
    onSuccess: () => {
      toast.success('問題を作成しました!');
      // フォームをリセット
      setQuestion("");
      setCorrectAnswer("");
      setOptions("");
      // 講師ダッシュボードに戻るか、続けて作成するか選択できるようにする
      toast.info('続けて問題を作成できます', { duration: 2000 });
    },
    onError: (error) => {
      toast.error(`問題の作成に失敗しました: ${error.message}`);
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
    
    if (!question.trim()) {
      toast.error('問題文を入力してください');
      return;
    }
    
    if (!correctAnswer.trim()) {
      toast.error('正解を入力してください');
      return;
    }

    createProblemMutation.mutate({
      problemType,
      difficulty,
      question,
      correctAnswer,
      options: options.trim() || undefined,
      xpReward,
      coinReward,
    });
  };

  // 問題タイプに応じたプレースホルダーとヒント
  const getProblemHints = () => {
    switch (problemType) {
      case 'addition':
        return {
          questionPlaceholder: '例: 2 + 3 は?',
          answerPlaceholder: '5',
          optionsPlaceholder: '["3", "4", "5", "6"] (JSON形式、オプション)',
        };
      case 'subtraction':
        return {
          questionPlaceholder: '例: 5 - 2 は?',
          answerPlaceholder: '3',
          optionsPlaceholder: '["1", "2", "3", "4"] (JSON形式、オプション)',
        };
      case 'comparison':
        return {
          questionPlaceholder: '例: 3と5、どちらがおおきい?',
          answerPlaceholder: '5',
          optionsPlaceholder: '["3", "5"] (JSON形式、オプション)',
        };
      case 'pattern':
        return {
          questionPlaceholder: '例: 1, 2, 3, ?, 5',
          answerPlaceholder: '4',
          optionsPlaceholder: '["3", "4", "5", "6"] (JSON形式、オプション)',
        };
      case 'shape':
        return {
          questionPlaceholder: '例: まるはいくつある?',
          answerPlaceholder: '3',
          optionsPlaceholder: '["2", "3", "4", "5"] (JSON形式、オプション)',
        };
    }
  };

  const hints = getProblemHints();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">問題作成</h1>
          <Button variant="outline" onClick={() => setLocation('/teacher')}>
            ← 戻る
          </Button>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 問題タイプ */}
            <div className="space-y-2">
              <Label htmlFor="problemType">問題タイプ *</Label>
              <Select
                value={problemType}
                onValueChange={(value: "addition" | "subtraction" | "comparison" | "pattern" | "shape") => setProblemType(value)}
              >
                <SelectTrigger id="problemType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addition">足し算 ➕</SelectItem>
                  <SelectItem value="subtraction">引き算 ➖</SelectItem>
                  <SelectItem value="comparison">比較 🔍</SelectItem>
                  <SelectItem value="pattern">パターン 🧩</SelectItem>
                  <SelectItem value="shape">図形 🔷</SelectItem>
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
                    setXpReward(5);
                    setCoinReward(2);
                  } else if (value === 'medium') {
                    setXpReward(10);
                    setCoinReward(5);
                  } else {
                    setXpReward(15);
                    setCoinReward(8);
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

            {/* 問題文 */}
            <div className="space-y-2">
              <Label htmlFor="question">問題文 *</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={hints.questionPlaceholder}
                rows={3}
                required
              />
            </div>

            {/* 正解 */}
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">正解 *</Label>
              <Input
                id="correctAnswer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder={hints.answerPlaceholder}
                required
              />
            </div>

            {/* 選択肢 */}
            <div className="space-y-2">
              <Label htmlFor="options">選択肢 (オプション)</Label>
              <Textarea
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder={hints.optionsPlaceholder}
                rows={2}
              />
              <p className="text-sm text-muted-foreground">
                選択肢を設定すると、生徒はボタンから選択できます。設定しない場合は自由入力になります。
              </p>
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
                  max={50}
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
                  max={20}
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
                disabled={createProblemMutation.isPending}
                className="flex-1 bg-secondary text-secondary-foreground"
              >
                {createProblemMutation.isPending ? '作成中...' : '問題を作成'}
              </Button>
            </div>
          </form>
        </Card>

        {/* プレビュー */}
        {question && (
          <Card className="p-8 mt-6">
            <h3 className="text-2xl font-bold mb-4">プレビュー</h3>
            <div className="problem-card">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {problemType === 'addition' && '➕'}
                  {problemType === 'subtraction' && '➖'}
                  {problemType === 'comparison' && '🔍'}
                  {problemType === 'pattern' && '🧩'}
                  {problemType === 'shape' && '🔷'}
                </div>
                <h2 className="text-3xl font-black">{question}</h2>
              </div>
              
              {options ? (
                <div className="grid grid-cols-2 gap-4">
                  {JSON.parse(options).map((option: string, index: number) => (
                    <Button
                      key={index}
                      className="h-20 text-2xl font-black"
                      variant="outline"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <Input
                  className="text-center text-4xl font-black p-6"
                  placeholder="?"
                  disabled
                />
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
