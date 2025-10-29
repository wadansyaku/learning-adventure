import { z } from 'zod';
import { studentProcedure } from './_procedures';
import { router } from '../_core/trpc';
import * as db from '../db';
import { eq } from 'drizzle-orm';
import { students, problems } from '../../drizzle/schema';

const OPENAI_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const OPENAI_API_URL = process.env.BUILT_IN_FORGE_API_URL || 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function getStudentContext(userId: number) {
  // 生徒プロフィール取得
  const student = await db.getStudentByUserId(userId);

  if (!student) {
    return null;
  }

  // 最近の学習進捗を取得（直近10問）
  const recentProgressList = await db.getStudentProgressByStudentId(userId, 10);
  const totalProblems = recentProgressList.length;
  const correctAnswers = recentProgressList.filter((p: any) => p.isCorrect).length;
  const recentAccuracy = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;

  return {
    student,
    recentProgressList,
    totalProblems,
    correctAnswers,
    recentAccuracy,
  };
}

export const chatRouter = router({
  // 挨拶メッセージを生成
  getGreeting: studentProcedure
    .mutation(async ({ ctx }) => {
      const context = await getStudentContext(ctx.user.id);

      if (!context) {
        return {
          message: 'こんにちは！いっしょにがんばろうね！',
        };
      }

      const { student, recentAccuracy, totalProblems } = context;

      const systemPrompt = `あなたは小学生の学習を応援するキャラクターです。
名前: ${student.displayName}さんのパートナー
性格: 明るく、優しく、励ましてくれる
口調: ひらがな多め、子供にわかりやすい言葉
目的: 学習を促進し、モチベーションを高める

生徒の情報:
- レベル: ${student.level}
- 経験値: ${student.xp}
- コイン: ${student.coins}
- 最近の正答率: ${recentAccuracy.toFixed(0)}%
- 総学習回数: ${totalProblems}問

挨拶メッセージを生成してください。生徒の状況に応じて、励ましたり、褒めたり、学習を促したりしてください。
メッセージは2-3文、50文字以内で簡潔に。`;

      const aiMessage = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '挨拶してください' },
      ]);

      return {
        message: aiMessage,
      };
    }),

  // メッセージを送信
  sendMessage: studentProcedure
    .input(z.object({
      message: z.string().min(1).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      const context = await getStudentContext(ctx.user.id);

      if (!context) {
        return {
          message: 'ごめんね、いまはおはなしできないよ。またあとでね！',
        };
      }

      const { student, recentAccuracy, totalProblems } = context;

      const systemPrompt = `あなたは小学生の学習を応援するキャラクターです。
名前: ${student.displayName}さんのパートナー
性格: 明るく、優しく、励ましてくれる
口調: ひらがな多め、子供にわかりやすい言葉
目的: 学習を促進し、モチベーションを高める

生徒の情報:
- レベル: ${student.level}
- 経験値: ${student.xp}
- コイン: ${student.coins}
- 最近の正答率: ${recentAccuracy.toFixed(0)}%
- 総学習回数: ${totalProblems}問

生徒からのメッセージに対して、以下のように応答してください:
1. 質問には優しく答える
2. 学習に関する話題では、具体的なアドバイスや励ましを提供
3. 雑談にも付き合うが、適度に学習を促す
4. メッセージは2-3文、80文字以内で簡潔に

重要: 必ず子供向けの優しい言葉遣いで、ひらがなを多く使ってください。`;

      const aiMessage = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.message },
      ]);

      return {
        message: aiMessage,
      };
    }),
});
