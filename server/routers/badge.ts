import { studentProcedure, publicProcedure } from './_procedures';
import { router } from '../_core/trpc';
import * as db from '../db';
import { z } from 'zod';

export const badgeRouter = router({
  /**
   * Get all badges
   */
  getAllBadges: publicProcedure.query(async () => {
    return await db.getAllBadges();
  }),

  /**
   * Get student's earned badges
   */
  getMyBadges: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) {
      throw new Error('Student not found');
    }
    
    return await db.getStudentBadges(student.id);
  }),

  /**
   * Check and award badges (called after actions)
   */
  checkBadges: studentProcedure.mutation(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) {
      throw new Error('Student not found');
    }
    
    const newBadges = await db.checkAndAwardBadges(student.id);
    return newBadges;
  }),
});
