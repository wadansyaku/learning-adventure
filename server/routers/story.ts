import { router, publicProcedure } from "../_core/trpc";
import { studentProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const storyRouter = router({
  // Get all chapters
  getChapters: publicProcedure.query(async () => {
    return await db.getAllStoryChapters();
  }),

  // Get chapter by ID
  getById: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getStoryChapterById(input.id);
    }),

  // Get student story progress
  getMyProgress: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) return [];
    
    return await db.getStudentStoryProgress(student.id);
  }),

  // Get learning quizzes for a chapter
  getQuizzes: publicProcedure
    .input(z.object({
      chapterId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getLearningQuizzesByChapter(input.chapterId);
    }),

  // Complete a chapter
  complete: studentProcedure
    .input(z.object({
      chapterId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
      }

      // Get chapter details
      const chapters = await db.getAllStoryChapters();
      const chapter = chapters.find(c => c.id === input.chapterId);
      
      if (!chapter) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Chapter not found' });
      }

      // Check if student level is sufficient
      if (student.level < chapter.requiredLevel) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'レベルがたりないよ!' });
      }

      // Mark chapter as completed
      await db.completeStoryChapter(student.id, input.chapterId);

      // Award XP and coins
      await db.updateStudentXP(student.id, chapter.xpReward);
      await db.updateStudentCoins(student.id, chapter.coinReward);

      // Check for level up
      const updatedStudent = await db.getStudentByUserId(ctx.user.id);
      if (updatedStudent) {
        const newLevel = Math.floor(updatedStudent.xp / 100) + 1;
        if (newLevel > updatedStudent.level) {
          await db.updateStudentLevel(student.id, newLevel);
        }
      }
      
      // Update daily mission progress
      await db.updateDailyMissionProgress(student.id, 'story_complete', 1);

      return { 
        success: true, 
        xpEarned: chapter.xpReward, 
        coinsEarned: chapter.coinReward 
      };
    }),
});
