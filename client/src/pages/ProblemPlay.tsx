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
  const [combo, setCombo] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);

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
        const newCombo = combo + 1;
        setCombo(newCombo);
        const comboBonus = Math.floor(newCombo / 3); // 3連続ごとにボーナス
        const bonusXP = data.xpEarned + comboBonus;
        const bonusCoins = data.coinsEarned + comboBonus;
        setTotalXP(totalXP + bonusXP);
        setTotalCoins(totalCoins + bonusCoins);
        
        if (newCombo >= 3 && newCombo % 3 === 0) {
          toast.success(`🔥 ${newCombo}れんぞくせいかい! ボーナス +${comboBonus}!`, {
            duration: 3000,
          });
        } else {
          toast.success(`せいかい! ${bonusXP} XP と ${bonusCoins} コインをゲット!`, {
            duration: 3000,
          });
        }
      } else {
        setCombo(0);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl">よみこみちゅう...</p>
        </div>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">もんだいがないよ</h2>
          <p className="mb-4 text-muted-foreground">せんせいにもんだいをつくってもらおう!</p>
          <Button onClick={() => setLocation('/student')}>もどる</Button>
        </Card>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];

  const handleNumberClick = (num: number) => {
    if (showResult) return;
    setAnswer(answer + num.toString());
  };

  const handleClear = () => {
    setAnswer("");
  };

  const handleBackspace = () => {
    setAnswer(answer.slice(0, -1));
  };

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
      toast.success(`ぜんぶおわったよ! すごい! ごうけい ${totalXP} XP と ${totalCoins} コインをゲット!`, {
        duration: 5000,
      });
      setTimeout(() => {
        setLocation('/student');
      }, 2000);
    }
  };

  const getEncouragementMessage = () => {
    const messages = [
      "がんばって! 🐰",
      "できるよ! 🐱",
      "すごいね! 🐶",
      "やったね! 🐻",
      "かっこいい! 🦊",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/student')}
            className="text-lg"
          >
            ← もどる
          </Button>
          <div className="flex gap-4">
            <div className="bg-white rounded-full px-4 py-2 shadow-md">
              <span className="text-sm text-muted-foreground">もんだい</span>
              <span className="ml-2 font-bold text-lg">{currentProblemIndex + 1}/{problems.length}</span>
            </div>
            {combo > 0 && (
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full px-4 py-2 shadow-md animate-pulse">
                <span className="text-sm">🔥 コンボ</span>
                <span className="ml-2 font-bold text-lg">{combo}</span>
              </div>
            )}
          </div>
        </div>

        {/* 問題カード */}
        <Card className="p-8 mb-6 bg-white/90 backdrop-blur shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-black mb-6 text-primary">
              {currentProblem.question}
            </h2>
            {currentProblem.imageUrl && (
              <img 
                src={currentProblem.imageUrl} 
                alt="問題画像" 
                className="mx-auto max-w-xs rounded-xl shadow-lg mb-4"
              />
            )}
          </div>

          {/* 回答表示エリア */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 min-h-[100px] flex items-center justify-center border-4 border-blue-300">
              <span className="text-6xl font-black text-blue-600">
                {answer || "?"}
              </span>
            </div>
          </div>

          {/* 数字パッド */}
          {!showResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className="h-20 text-4xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-all"
                  >
                    {num}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  onClick={handleClear}
                  className="h-20 text-2xl font-bold bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white shadow-lg"
                >
                  クリア
                </Button>
                <Button
                  onClick={() => handleNumberClick(0)}
                  className="h-20 text-4xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-all"
                >
                  0
                </Button>
                <Button
                  onClick={handleBackspace}
                  className="h-20 text-2xl font-bold bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white shadow-lg"
                >
                  ← けす
                </Button>
              </div>
            </div>
          )}

          {/* 結果表示 */}
          {showResult && (
            <div className="text-center space-y-6 animate-fade-in">
              {isCorrect ? (
                <>
                  <div className="text-9xl animate-bounce">🎉</div>
                  <h3 className="text-5xl font-black text-green-600">せいかい!</h3>
                  <p className="text-2xl">{getEncouragementMessage()}</p>
                </>
              ) : (
                <>
                  <div className="text-9xl">😢</div>
                  <h3 className="text-5xl font-black text-red-600">ざんねん...</h3>
                  <p className="text-3xl font-bold">こたえ: {currentProblem.correctAnswer}</p>
                  <p className="text-xl text-muted-foreground">つぎはがんばろう!</p>
                </>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="mt-8">
            {!showResult ? (
              <Button
                onClick={handleSubmit}
                disabled={!answer || submitAnswerMutation.isPending}
                className="w-full h-20 text-3xl font-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl transform hover:scale-105 transition-all"
              >
                {submitAnswerMutation.isPending ? 'かくにんちゅう...' : 'こたえる!'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full h-20 text-3xl font-black bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-2xl transform hover:scale-105 transition-all"
              >
                {currentProblemIndex < problems.length - 1 ? 'つぎへ →' : 'おわり!'}
              </Button>
            )}
          </div>
        </Card>

        {/* 応援メッセージ */}
        {!showResult && (
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 animate-pulse">
              {getEncouragementMessage()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
