import { router } from "../_core/trpc";
import { publicProcedure, studentProcedure } from "./_procedures";
import * as db from "../db";
import { z } from "zod";

export const rankingRouter = router({
  // Get global ranking
  getGlobalRanking: publicProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(async ({ input }) => {
      return await db.getGlobalRanking(input.limit);
    }),

  // Get weekly ranking
  getWeeklyRanking: publicProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(async ({ input }) => {
      return await db.getWeeklyRanking(input.limit);
    }),

  // Get monthly ranking
  getMonthlyRanking: publicProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(async ({ input }) => {
      return await db.getMonthlyRanking(input.limit);
    }),

  // Get student's rank
  getMyRank: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) return null;
    
    return await db.getStudentRank(student.id);
  }),
});
