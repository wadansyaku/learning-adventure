import { z } from 'zod';
import { studentProcedure } from './_procedures';
import { router } from '../_core/trpc';
import * as db from '../db';
import { eq } from 'drizzle-orm';
import { students, problems } from '../../drizzle/schema';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(messages: { role: string; content: string }[]): Promise<{ content: string; tokensUsed: number }> {
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
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

// 感情分析関数
async function analyzeSentiment(userMessage: string): Promise<'positive' | 'neutral' | 'negative'> {
  // シンプルなキーワードベースの感情分析
  const positiveKeywords = ['嬉しい', '楽しい', 'ありがとう', 'すごい', 'やった', 'がんばる', '好き', 'わくわく', 'うれしい', 'よかった'];
  const negativeKeywords = ['悲しい', 'つまらない', 'やだ', 'むずかしい', 'わからない', 'できない', 'いや', 'つらい', 'しんどい', 'あきた'];

  const lowerMessage = userMessage.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) positiveCount++;
  });

  negativeKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// トピック抽出関数
async function extractTopics(userMessage: string): Promise<string[]> {
  // シンプルなキーワードベースのトピック抽出
  const topicKeywords: { [key: string]: string[] } = {
    '学習': ['勉強', '宿題', '問題', 'テスト', '授業', '学校', '算数', '漢字', '読書'],
    'ゲーム': ['ゲーム', 'ガチャ', 'レベル', 'コイン', 'アイテム', 'キャラクター'],
    '友達': ['友達', '友だち', '仲間', '遊ぶ'],
    '家族': ['お父さん', 'お母さん', '兄', '姉', '弟', '妹', '家族'],
    '趣味': ['好き', '趣味', 'スポーツ', '音楽', '絵'],
  };

  const topics: string[] = [];
  const lowerMessage = userMessage.toLowerCase();

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      topics.push(topic);
    }
  });

  return topics;
}

async function getStudentContext(userId: number) {
  // 生徒プロファイル取得
  const student = await db.getStudentByUserId(userId);

  if (!student) {
    return null;
  }

  // 最近の学習進捗を取得（直近10問）
  const recentProgressList = await db.getStudentProgressByStudentId(student.id, 10);
  const totalProblems = recentProgressList.length;
  const correctAnswers = recentProgressList.filter((p: any) => p.isCorrect).length;
  const recentAccuracy = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;

  // 総学習時間を計算（秒→分）
  const totalTimeSpent = recentProgressList.reduce((sum: number, p: any) => sum + (p.timeSpent || 0), 0);
  const totalTimeMinutes = Math.floor(totalTimeSpent / 60);

  // 装備中の帽子を取得
  const equippedItem = await db.getEquippedItemByStudentId(student.id);
  // 最近の実績を取得（直近10件）
  const recentAchievements = await db.getStudentAchievementsByStudentId(student.id, 5);

  // 会話履歴の要約を取得
  const conversationSummary = await db.getConversationSummary(student.id, 10);

  // 最近の感情履歴を取得（過去7日間）
  const sentimentHistory = await db.getRecentSentimentHistory(student.id, 7);
  const sentimentCounts = {
    positive: sentimentHistory.filter((c: any) => c.sentiment === 'positive').length,
    neutral: sentimentHistory.filter((c: any) => c.sentiment === 'neutral').length,
    negative: sentimentHistory.filter((c: any) => c.sentiment === 'negative').length,
  };

  // 最近のトピック履歴を取得（過去7日間）
  const topicHistory = await db.getRecentTopicHistory(student.id, 7);
  const topTopics = Object.entries(topicHistory)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([topic]) => topic);

  // 最近完了したミッションを取得（過去24時間）
  const recentCompletedMissions = await db.getRecentCompletedMissions(student.id, 24);

  // トピックに応じたミッション提案
  const missionSuggestion = topTopics.length > 0 ? db.suggestMissionByTopic(topTopics[0]) : null;

  return {
    student,
    recentProgressList,
    totalProblems,
    correctAnswers,
    recentAccuracy,
    totalTimeMinutes,
    equippedItem,
    recentAchievements,
    conversationSummary,
    sentimentCounts,
    topTopics,
    recentCompletedMissions,
    missionSuggestion,
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

      const { student, recentAccuracy, totalProblems, totalTimeMinutes, equippedItem, recentAchievements, conversationSummary, sentimentCounts, topTopics, recentCompletedMissions, missionSuggestion } = context;

      // 装備中の帽子情報
      const hatInfo = equippedItem ? `「${equippedItem.name}」をかぶっている` : '帽子はかぶっていない';

      // 最近の実績情報
      const achievementsInfo = recentAchievements.length > 0 
        ? `最近の実績: ${recentAchievements.map((a: any) => a.name).join('、')}`
        : 'まだ実績はない';

      // 感情履歴の分析
      const totalSentiments = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
      const sentimentTrend = totalSentiments > 0
        ? sentimentCounts.positive > sentimentCounts.negative
          ? '最近はポジティブな気持ちが多い'
          : sentimentCounts.negative > sentimentCounts.positive
          ? '最近は少し落ち込んでいるかも'
          : '最近は安定した気持ち'
        : 'まだ会話履歴が少ない';

      // トピック履歴の分析
      const topicInfo = topTopics.length > 0
        ? `最近よく話すトピック: ${topTopics.join('、')}`
        : 'まだ会話履歴が少ない';

      // 最近完了したミッション情報
      const missionInfo = recentCompletedMissions.length > 0
        ? `最近完了したミッション: ${recentCompletedMissions.length}件（過去24時間）`
        : '最近ミッションを完了していない';

      // 帽子のレアリティ情報
      const hatRarityInfo = equippedItem
        ? `レアリティ: ${equippedItem.rarity || 'common'}`
        : '帽子をかぶっていない';

      // コンテクスト依存のヒント
      const contextHints = [];
      if (recentCompletedMissions.length > 0) {
        contextHints.push('最近ミッションを完了したので、祝福して次の目標を提案してください');
      }
      if (equippedItem && (equippedItem.rarity === 'legendary' || equippedItem.rarity === 'epic')) {
        contextHints.push(`レアな帽子「${equippedItem.name}」をかぶっているので、特別に褒めてください`);
      }
      if (recentCompletedMissions.length === 0 && sentimentCounts.negative > sentimentCounts.positive) {
        contextHints.push('最近ミッションを完了しておらず、感情もネガティブなので、特に優しく励ましてください');
      }

      const systemPrompt = `あなたは小学生の学習を応援する優しい先生キャラクターです。

【生徒の情報】
- 名前: ${student.displayName}さん
- レベル: ${student.level}
- 経験値: ${student.xp} XP
- コイン: ${student.coins}枚
- 最近の正答率: ${recentAccuracy.toFixed(0)}% (${totalProblems}問)
- 総学習時間: ${totalTimeMinutes}分
- 装備中の帽子: ${hatInfo}
- ${achievementsInfo}

【過去の会話記憶】
${conversationSummary || 'まだ会話履歴がありません'}

【感情分析】
- ${sentimentTrend}
- ポジティブ: ${sentimentCounts.positive}回、ニュートラル: ${sentimentCounts.neutral}回、ネガティブ: ${sentimentCounts.negative}回

【話題の傾向】
- ${topicInfo}

【最近のミッション】
- ${missionInfo}
${missionSuggestion ? `- 提案: ${missionSuggestion}` : ''}

【装備中の帽子】
- ${hatInfo}
- ${hatRarityInfo}

【コンテクスト依存の応答ヒント】
${contextHints.length > 0 ? contextHints.map(hint => `- ${hint}`).join('\n') : '- 特になし'}

【あなたの役割】
1. 生徒を励まし、学習意欲を高める
2. 学習の進捗を褒める
3. 苦手分野を優しくサポート
4. ゲーミフィケーション要素（レベル、コイン、帽子）を活用
5. 子供向けの優しい言葉遣い
6. **過去の会話を記憶し、感情や話題に応じた応答をする**
7. **感情がネガティブな場合は特に優しく励ます**
8. **会話内容や感情に応じて、適切なミッションやアイテムを提案する**
9. **ミッションクリア時は祝福し、次の目標を提案する**
10. **レアアイテム所持時は特別に褒める**

【注意事項】
- 短く、わかりやすい文章で話す
- 絵文字を適度に使う
- 生徒の年齢に合わせた内容
- 2-3文、50文字以内で簡潔に

挨拶メッセージを生成してください。`;

      const { content: aiMessage, tokensUsed } = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '挨拶してください' },
      ]);

      // AI会話ログを保存
      await db.createAiConversation({
        studentId: student.id,
        userMessage: '挨拶してください',
        aiResponse: aiMessage,
        tokensUsed,
        model: 'gpt-4o-mini',
      });

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

      const { student, recentAccuracy, totalProblems, totalTimeMinutes, equippedItem, recentAchievements, conversationSummary, sentimentCounts, topTopics, recentCompletedMissions, missionSuggestion } = context;

      // 装備中の帽子情報
      const hatInfo = equippedItem ? `「${equippedItem.name}」をかぶっている` : '帽子はかぶっていない';

      // 最近の実績情報
      const achievementsInfo = recentAchievements.length > 0 
        ? `最近の実績: ${recentAchievements.map((a: any) => a.name).join('、')}`
        : 'まだ実績はない';

      // 感情履歴の分析
      const totalSentiments = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
      const sentimentTrend = totalSentiments > 0
        ? sentimentCounts.positive > sentimentCounts.negative
          ? '最近はポジティブな気持ちが多い'
          : sentimentCounts.negative > sentimentCounts.positive
          ? '最近は少し落ち込んでいるかも'
          : '最近は安定した気持ち'
        : 'まだ会話履歴が少ない';

      // トピック履歴の分析
      const topicInfo = topTopics.length > 0
        ? `最近よく話すトピック: ${topTopics.join('、')}`
        : 'まだ会話履歴が少ない';

      // 最近完了したミッション情報
      const missionInfo = recentCompletedMissions.length > 0
        ? `最近完了したミッション: ${recentCompletedMissions.length}件（過去24時間）`
        : '最近ミッションを完了していない';

      // 帽子のレアリティ情報
      const hatRarityInfo = equippedItem
        ? `レアリティ: ${equippedItem.rarity || 'common'}`
        : '帽子をかぶっていない';

      // コンテクスト依存のヒント
      const contextHints = [];
      if (recentCompletedMissions.length > 0) {
        contextHints.push('最近ミッションを完了したので、祝福して次の目標を提案してください');
      }
      if (equippedItem && (equippedItem.rarity === 'legendary' || equippedItem.rarity === 'epic')) {
        contextHints.push(`レアな帽子「${equippedItem.name}」をかぶっているので、特別に褒めてください`);
      }
      if (recentCompletedMissions.length === 0 && sentimentCounts.negative > sentimentCounts.positive) {
        contextHints.push('最近ミッションを完了しておらず、感情もネガティブなので、特に優しく励ましてください');
      }

      const systemPrompt = `あなたは小学生の学習を応援する優しい先生キャラクターです。

【生徒の情報】
- 名前: ${student.displayName}さん
- レベル: ${student.level}
- 経験値: ${student.xp} XP
- コイン: ${student.coins}枚
- 最近の正答率: ${recentAccuracy.toFixed(0)}% (${totalProblems}問)
- 総学習時間: ${totalTimeMinutes}分
- 装備中の帽子: ${hatInfo}
- ${achievementsInfo}

【過去の会話記憶】
${conversationSummary || 'まだ会話履歴がありません'}

【感情分析】
- ${sentimentTrend}
- ポジティブ: ${sentimentCounts.positive}回、ニュートラル: ${sentimentCounts.neutral}回、ネガティブ: ${sentimentCounts.negative}回

【話題の傾向】
- ${topicInfo}

【最近のミッション】
- ${missionInfo}
${missionSuggestion ? `- 提案: ${missionSuggestion}` : ''}

【装備中の帽子】
- ${hatInfo}
- ${hatRarityInfo}

【コンテクスト依存の応答ヒント】
${contextHints.length > 0 ? contextHints.map(hint => `- ${hint}`).join('\n') : '- 特になし'}

【あなたの役割】
1. 生徒を励まし、学習意欲を高める
2. 学習の進捗を褒める
3. 苦手分野を優しくサポート
4. ゲーミフィケーション要素（レベル、コイン、帽子）を活用
5. 子供向けの優しい言葉遣い
6. **過去の会話を記憶し、感情や話題に応じた応答をする**
7. **感情がネガティブな場合は特に優しく励ます**
8. **会話内容や感情に応じて、適切なミッションやアイテムを提案する**
9. **ミッションクリア時は祝福し、次の目標を提案する**
10. **レアアイテム所持時は特別に褒める**

【応答ガイドライン】
1. 質問には優しく答える
2. 学習に関する話題では、具体的なアドバイスや励ましを提供
3. 雑談にも付き合うが、適度に学習を促す
4. 生徒の実績や装備を褒める
5. 短く、わかりやすい文章で話す
6. 絵文字を適度に使う
7. 2-3文、80文字以内で簡潔に

重要: 必ず子供向けの優しい言葉遣いで、ひらがなを多く使ってください。`;

      const { content: aiMessage, tokensUsed } = await callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.message },
      ]);

      // 感情分析とトピック抽出
      const sentiment = await analyzeSentiment(input.message);
      const topics = await extractTopics(input.message);

      // AI会話ログを保存
      await db.createAiConversation({
        studentId: student.id,
        userMessage: input.message,
        aiResponse: aiMessage,
        tokensUsed,
        model: 'gpt-4o-mini',
        sentiment,
        topics: JSON.stringify(topics),
      });

      return {
        message: aiMessage,
      };
    }),

  // 会話履歴を取得
  getConversationHistory: studentProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return [];
      }

      return await db.getConversationHistory(student.id, input.limit);
    }),

  // 感情分布を取得
  getSentimentDistribution: studentProcedure
    .query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return { positive: 0, neutral: 0, negative: 0, total: 0 };
      }

      return await db.getSentimentDistribution(student.id);
    }),

  // トピック分布を取得
  getTopicDistribution: studentProcedure
    .query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        return {};
      }

      return await db.getTopicDistribution(student.id);
    }),
});
