import { router } from "../_core/trpc";
import { studentProcedure, teacherProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const problemRouter = router({
  // Get random problems
  getRandom: studentProcedure
    .input(z.object({
      difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
      limit: z.number().default(5),
    }))
    .query(async ({ input }) => {
      return await db.getRandomProblems(input.difficulty, input.limit);
    }),

  // Submit answer
  submitAnswer: studentProcedure
    .input(z.object({
      problemId: z.number(),
      answer: z.string(),
      timeSpent: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
      }
      
      const problem = await db.getProblemById(input.problemId);
      if (!problem) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Problem not found' });
      }
      
      const isCorrect = input.answer.trim().toLowerCase() === problem.correctAnswer.trim().toLowerCase();
      const xpEarned = isCorrect ? problem.xpReward : 0;
      const coinsEarned = isCorrect ? problem.coinReward : 0;
      
      // Record progress
      await db.createStudentProgress({
        studentId: student.id,
        problemId: input.problemId,
        isCorrect,
        timeSpent: input.timeSpent,
        xpEarned,
        coinsEarned,
      });
      
      // Award rewards if correct
      if (isCorrect) {
        await db.updateStudentXP(student.id, xpEarned);
        await db.updateStudentCoins(student.id, coinsEarned);
        
        // Check for level up
        const updatedStudent = await db.getStudentByUserId(ctx.user.id);
        if (updatedStudent) {
          const newLevel = Math.floor(updatedStudent.xp / 100) + 1;
          if (newLevel > updatedStudent.level) {
            await db.updateStudentLevel(student.id, newLevel);
          }
        }
        
        // Update daily mission progress
        await db.updateDailyMissionProgress(student.id, 'solve_problems', 1);
      }
      
      return { 
        success: true, 
        isCorrect, 
        xpEarned, 
        coinsEarned,
        correctAnswer: problem.correctAnswer 
      };
    }),

  // Create problem (teacher only)
  create: teacherProcedure
    .input(z.object({
      problemType: z.enum(['addition', 'subtraction', 'comparison', 'pattern', 'shape']),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      question: z.string(),
      correctAnswer: z.string(),
      options: z.string().optional(),
      imageUrl: z.string().optional(),
      xpReward: z.number().default(5),
      coinReward: z.number().default(2),
    }))
    .mutation(async ({ input }) => {
      await db.createProblem(input);
      return { success: true };
    }),
});
