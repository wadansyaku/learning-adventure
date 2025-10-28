import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProblemPlay() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const { data: problems, isLoading: problemsLoading, refetch } = trpc.problem.getRandom.useQuery({
    difficulty: 'easy',
    limit: 5,
  }, {
    enabled: isAuthenticated && user?.role === 'student',
  });

  const submitAnswerMutation = trpc.problem.submitAnswer.useMutation({
    onSuccess: (data) => {
      setIsCorrect(data.isCorrect);
      setShowResult(true);
      if (data.isCorrect) {
        toast.success(`せいかい! ${data.xpEarned} XP と ${data.coinsEarned} コインをゲット!`, {
          duration: 3000,
        });
      } else {
        toast.error(`ざんねん... こたえは ${data.correctAnswer} だよ`, {
          duration: 3000,
        });
      }
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'student')) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentProblemIndex]);

  if (authLoading || problemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">もんだいがないよ</h2>
          <p className="mb-4 text-muted-foreground">せんせいにもんだいをつくってもらおう!</p>
          <Button onClick={() => setLocation('/student')}>もどる</Button>
        </Card>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error('こたえをにゅうりょくしてね!');
      return;
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    submitAnswerMutation.mutate({
      problemId: currentProblem.id,
      answer: answer,
      timeSpent: timeSpent,
    });
  };

  const handleNext = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setAnswer("");
      setShowResult(false);
      setIsCorrect(false);
    } else {
      // 全問終了
      toast.success('ぜんぶおわったよ! すごい!', {
        duration: 3000,
      });
      setTimeout(() => {
        setLocation('/student');
      }, 2000);
    }
  };

  const handleTryAgain = () => {
    setAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setStartTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => setLocation('/student')}>
            ← もどる
          </Button>
          <div className="text-xl font-bold">
            もんだい {currentProblemIndex + 1} / {problems.length}
          </div>
        </div>

        {/* 問題カード */}
        <div className="problem-card mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-6 animate-bounce-slow">
              {currentProblem.problemType === 'addition' && '➕'}
              {currentProblem.problemType === 'subtraction' && '➖'}
              {currentProblem.problemType === 'comparison' && '🔍'}
              {currentProblem.problemType === 'pattern' && '🧩'}
              {currentProblem.problemType === 'shape' && '🔷'}
            </div>
            <h2 className="text-4xl font-black mb-6 text-shadow">
              {currentProblem.question}
            </h2>
          </div>

          {!showResult ? (
            <div className="space-y-6">
              {currentProblem.options ? (
                // 選択肢がある場合
                <div className="grid grid-cols-2 gap-4">
                  {JSON.parse(currentProblem.options).map((option: string, index: number) => (
                    <Button
                      key={index}
                      className="btn-fun h-24 text-3xl font-black"
                      variant={answer === option ? "default" : "outline"}
                      onClick={() => setAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                // 自由入力
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full text-center text-5xl font-black p-6 rounded-3xl border-4 border-primary/30 focus:border-primary focus:outline-none"
                  placeholder="?"
                  autoFocus
                />
              )}

              <Button
                className="btn-fun w-full bg-primary text-primary-foreground text-2xl py-8"
                onClick={handleSubmit}
                disabled={submitAnswerMutation.isPending}
              >
                {submitAnswerMutation.isPending ? 'かくにんちゅう...' : 'こたえる!'}
              </Button>
            </div>
          ) : (
            // 結果表示
            <div className="text-center space-y-6">
              <div className={`text-9xl ${isCorrect ? 'animate-bounce' : 'animate-wiggle'}`}>
                {isCorrect ? '🎉' : '😢'}
              </div>
              <h3 className={`text-5xl font-black ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                {isCorrect ? 'せいかい!' : 'ざんねん!'}
              </h3>
              {!isCorrect && (
                <p className="text-2xl text-muted-foreground">
                  こたえは <span className="font-bold text-foreground">{currentProblem.correctAnswer}</span> だよ
                </p>
              )}
              <div className="flex gap-4">
                {!isCorrect && (
                  <Button
                    className="btn-fun flex-1 bg-secondary text-secondary-foreground text-xl py-6"
                    onClick={handleTryAgain}
                  >
                    もういちど
                  </Button>
                )}
                <Button
                  className="btn-fun flex-1 bg-primary text-primary-foreground text-xl py-6"
                  onClick={handleNext}
                >
                  {currentProblemIndex < problems.length - 1 ? 'つぎへ' : 'おわり'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 進捗バー */}
        <div className="xp-bar">
          <div 
            className="xp-bar-fill" 
            style={{ width: `${((currentProblemIndex + 1) / problems.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
