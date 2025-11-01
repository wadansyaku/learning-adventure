import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

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
        // 紙吹雪アニメーションを発動
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
        });
        
        const newCombo = combo + 1;
        setCombo(newCombo);
        const comboBonus = Math.floor(newCombo / 3); // 3連続ごとにボーナス
        const bonusXP = data.xpEarned + comboBonus;
        const bonusCoins = data.coinsEarned + comboBonus;
        setTotalXP(totalXP + bonusXP);
        setTotalCoins(totalCoins + bonusCoins);
        
        if (newCombo >= 3 && newCombo % 3 === 0) {
          // コンボボーナス時はさらに紙吹雪
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 120,
              origin: { y: 0.5 },
              colors: ['#ff6b00', '#ffd700', '#ff1493'],
            });
          }, 300);
          console.log(`Combo bonus: ${newCombo} combo, +${comboBonus} bonus`);
        } else {
          console.log(`Correct answer: +${bonusXP} XP, +${bonusCoins} coins`);
        }
      } else {
        setCombo(0);
        console.log(`Wrong answer, correct answer was: ${data.correctAnswer}`);
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
      // toast.error('こたえをにゅうりょくしてね!');
      console.log('No answer provided');
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
      // toast.success(`ぜんぶおわったよ! すごい! ごうけい ${totalXP} XP と ${totalCoins} コインをゲット!`, {
      //   duration: 5000,
      // });
      console.log(`All problems completed: +${totalXP} XP, +${totalCoins} coins`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pb-safe">
      <div className="max-w-2xl mx-auto pb-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/student')}
              className="text-lg hover:scale-105 transition-transform"
            >
              ← もどる
            </Button>
            <div className="flex gap-4">
              <div className="bg-white rounded-full px-4 py-2 shadow-md">
                <span className="text-sm text-muted-foreground">もんだい</span>
                <span className="ml-2 font-bold text-lg">{currentProblemIndex + 1}/{problems.length}</span>
              </div>
              {combo > 0 && (
                <motion.div 
                  className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full px-4 py-2 shadow-md"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <span className="text-sm">🔥 コンボ</span>
                  <span className="ml-2 font-bold text-lg">{combo}</span>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* 進捗バー */}
          <div className="bg-white rounded-full p-2 shadow-md">
            <div className="flex gap-2">
              {problems.map((_, index) => (
                <motion.div
                  key={index}
                  className={`flex-1 h-3 rounded-full ${
                    index < currentProblemIndex
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : index === currentProblemIndex
                      ? 'bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse'
                      : 'bg-gray-200'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 問題カード */}
        <Card className="p-4 sm:p-6 md:p-8 mb-6 bg-white/90 backdrop-blur shadow-2xl">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-primary">
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
          <div className="mb-3 sm:mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-3 sm:p-4 min-h-[60px] sm:min-h-[80px] flex items-center justify-center border-4 border-blue-300">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-600">
                {answer || "?"}
              </span>
            </div>
          </div>

          {/* 数字パッド - モバイル最適化 */}
          {!showResult && (
            <div className="space-y-2 sm:space-y-3">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className="h-12 sm:h-14 md:h-16 text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 active:scale-95 text-white shadow-lg transform hover:scale-105 transition-all touch-manipulation"
                  >
                    {num}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Button
                  onClick={handleClear}
                  className="h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl font-bold bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 active:scale-95 text-white shadow-lg touch-manipulation"
                >
                  クリア
                </Button>
                <Button
                  onClick={() => handleNumberClick(0)}
                  className="h-12 sm:h-14 md:h-16 text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 active:scale-95 text-white shadow-lg transform hover:scale-105 transition-all touch-manipulation"
                >
                  0
                </Button>
                <Button
                  onClick={handleBackspace}
                  className="h-12 sm:h-14 md:h-16 text-base sm:text-lg md:text-xl font-bold bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 active:scale-95 text-white shadow-lg touch-manipulation"
                >
                  ← けす
                </Button>
              </div>
            </div>
          )}

          {/* 結果表示 */}
          <AnimatePresence>
            {showResult && (
              <motion.div 
                className="text-center space-y-6"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {isCorrect ? (
                  <>
                    <motion.div 
                      className="text-9xl"
                      animate={{ 
                        rotate: [0, 10, -10, 10, -10, 0],
                        scale: [1, 1.2, 1, 1.2, 1]
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      🎉
                    </motion.div>
                    <motion.h3 
                      className="text-6xl font-black text-green-600"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      せいかい!
                    </motion.h3>
                    <motion.p 
                      className="text-3xl font-bold"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {getEncouragementMessage()}
                    </motion.p>
                    <motion.div
                      className="flex justify-center gap-4 text-2xl"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="bg-blue-100 px-4 py-2 rounded-full font-bold text-blue-600">
                        +{submitAnswerMutation.data?.xpEarned || 0} XP
                      </span>
                      <span className="bg-yellow-100 px-4 py-2 rounded-full font-bold text-yellow-600">
                        +{submitAnswerMutation.data?.coinsEarned || 0} コイン
                      </span>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div 
                      className="text-9xl"
                      animate={{ 
                        y: [0, -10, 0],
                      }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      😢
                    </motion.div>
                    <motion.h3 
                      className="text-5xl font-black text-red-600"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      ざんねん...
                    </motion.h3>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-3xl font-bold mb-2">こたえ: {currentProblem.correctAnswer}</p>
                      <p className="text-xl text-muted-foreground">つぎはがんばろう! 💪</p>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* アクションボタン */}
          <div className="mt-4 sm:mt-6">
            {!showResult ? (
              <Button
                onClick={handleSubmit}
                disabled={!answer || submitAnswerMutation.isPending}
                className="w-full h-16 sm:h-18 md:h-20 text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl transform hover:scale-105 transition-all"
              >
                {submitAnswerMutation.isPending ? 'かくにんちゅう...' : 'こたえる!'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full h-16 sm:h-18 md:h-20 text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-2xl transform hover:scale-105 transition-all"
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
