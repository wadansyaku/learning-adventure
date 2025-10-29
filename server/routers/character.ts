import { router } from "../_core/trpc";
import { studentProcedure, publicProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";

export const characterRouter = router({
  // Get all character types (master data)
  getAllTypes: publicProcedure.query(async () => {
    return await db.getAllCharacterTypes();
  }),

  // Get student's characters
  getMyCharacters: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) return [];
    
    return await db.getCharactersByStudentId(student.id);
  }),

  // Create new character
  create: studentProcedure
    .input(z.object({
      name: z.string(),
      animalType: z.string(),
      imageUrl: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
      }
      
      await db.createCharacter({
        studentId: student.id,
        name: input.name,
        animalType: input.animalType,
        imageUrl: input.imageUrl,
      });
      
      return { success: true };
    }),

  // Chat with character using GPT-4o
  chat: studentProcedure
    .input(z.object({
      characterId: z.number(),
      message: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
      }

      // Check usage limits
      const usageLimits = await db.checkStudentUsageLimits(student.id);
      
      // If blocked (100%), return fixed response
      if (usageLimits.restrictionLevel === 'blocked') {
        const fixedResponses = [
          'ごめんね、今日はもうおやすみの時間だよ。また明日お話ししようね！😊',
          'たくさんお話ししてくれてありがとう！今日はこれでおわりにしようね。また明日！✨',
          '今日はいっぱいお勉強したね！もう休憩しよう。また明日がんばろう！🌟',
        ];
        return {
          response: fixedResponses[Math.floor(Math.random() * fixedResponses.length)],
          usageInfo: {
            restrictionLevel: 'blocked',
            message: '今日のお話し制限に達しました。また明日お話ししようね！',
          },
        };
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      try {
        // Build conversation context
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          {
            role: 'system',
            content: `あなたは子供向け学習アプリのキャラクターです。
- 子供に優しく、楽しく会話してください
- ひらがなとカタカナを中心に使ってください
- 学習を応援し、励ましてください
- 短くわかりやすい返答を心がけてください
- 絵文字を適度に使って親しみやすく話してください`,
          },
        ];

        // Add conversation history (keep last 10 messages for context)
        if (input.conversationHistory && input.conversationHistory.length > 0) {
          const recentHistory = input.conversationHistory.slice(-10);
          messages.push(...recentHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content,
          })));
        }

        // Add current message
        messages.push({
          role: 'user',
          content: input.message,
        });

        const startTime = Date.now();
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages,
          max_tokens: 150,
          temperature: 0.8,
        });
        const responseTime = Date.now() - startTime;

        const responseText = completion.choices[0]?.message?.content || 'ごめんね、よくわからなかったよ。';

        // Log usage
        const cost = calculateCost(completion.usage?.prompt_tokens || 0, completion.usage?.completion_tokens || 0);
        await db.logOpenAIUsage({
          userId: ctx.user.id,
          endpoint: 'chat.completions',
          model: 'gpt-4o',
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
          estimatedCost: cost.toFixed(6),
        });

        return { 
          response: responseText,
          usageInfo: {
            restrictionLevel: usageLimits.restrictionLevel,
            message: usageLimits.restrictionLevel === 'warning' 
              ? 'お話しがたくさんになってきたね！そろそろ休憩しようかな？'
              : usageLimits.restrictionLevel === 'delay'
              ? 'たくさんお話ししてくれてありがとう！もう少しで今日のおやすみ時間だよ。'
              : undefined,
          },
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fallback to simple response
        const responses = [
          'こんにちは！今日もがんばろうね！',
          'わあ！たのしそうだね！',
          'いっしょにがんばろう！',
          'すごいね！もっとおしえて！',
        ];
        return { 
          response: responses[Math.floor(Math.random() * responses.length)]
        };
      }
    }),
});

// Calculate cost for GPT-4o
// Input: $2.50 per 1M tokens
// Output: $10.00 per 1M tokens
function calculateCost(promptTokens: number, completionTokens: number): number {
  const inputCost = (promptTokens / 1_000_000) * 2.5;
  const outputCost = (completionTokens / 1_000_000) * 10.0;
  return inputCost + outputCost;
}
