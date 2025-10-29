import { router, publicProcedure } from "../_core/trpc";
import { studentProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

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

  // Chat with character (placeholder - OpenAI integration removed for simplification)
  chat: studentProcedure
    .input(z.object({
      characterId: z.number(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
      }

      // Simple placeholder response
      const responses = [
        'こんにちは！今日もがんばろうね！',
        'わあ！たのしそうだね！',
        'いっしょにがんばろう！',
        'すごいね！もっとおしえて！',
      ];
      const responseText = responses[Math.floor(Math.random() * responses.length)];
      
      return { 
        response: responseText
      };
    }),
});
