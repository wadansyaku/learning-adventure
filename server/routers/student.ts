import { router, protectedProcedure } from "../_core/trpc";
import { studentProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const studentRouter = router({
  // Get current student profile
  getProfile: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Student profile not found' });
    }
    return student;
  }),

  // Create student profile
  createProfile: protectedProcedure
    .input(z.object({
      displayName: z.string(),
      avatarIcon: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.getStudentByUserId(ctx.user.id);
      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Student profile already exists' });
      }
      
      await db.createStudent({
        userId: ctx.user.id,
        displayName: input.displayName,
        avatarIcon: input.avatarIcon,
      });
      
      return { success: true };
    }),

  // Check login bonus eligibility
  checkLoginBonus: studentProcedure.mutation(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
    }

    const now = new Date();
    const lastLogin = student.lastLoginDate ? new Date(student.lastLoginDate) : null;
    
    // Check if already claimed today
    if (lastLogin) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      
      if (today.getTime() === lastLoginDay.getTime()) {
        return { eligible: false };
      }
    }

    // Calculate new streak (same logic as claimLoginBonus)
    let newStreak = 1;
    if (lastLogin) {
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      
      if (yesterday.getTime() === lastLoginDay.getTime()) {
        newStreak = student.loginStreak + 1;
      }
    }

    // Calculate bonus based on new streak
    const baseCoins = 10;
    const baseXP = 5;
    const streakBonus = Math.min(newStreak, 7); // Max 7 days bonus
    
    return {
      eligible: true,
      loginStreak: newStreak,
      coinsEarned: baseCoins + streakBonus * 2,
      xpEarned: baseXP + streakBonus,
    };
  }),

  // Claim login bonus
  claimLoginBonus: studentProcedure.mutation(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
    }

    const now = new Date();
    const lastLogin = student.lastLoginDate ? new Date(student.lastLoginDate) : null;
    
    // Check if already claimed today
    if (lastLogin) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      
      if (today.getTime() === lastLoginDay.getTime()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '今日はもうもらったよ!' });
      }
    }

    // Calculate new streak
    let newStreak = 1;
    if (lastLogin) {
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      
      if (yesterday.getTime() === lastLoginDay.getTime()) {
        newStreak = student.loginStreak + 1;
      }
    }

    // Calculate bonus
    const baseCoins = 10;
    const baseXP = 5;
    const streakBonus = Math.min(newStreak, 7);
    const coinsEarned = baseCoins + streakBonus * 2;
    const xpEarned = baseXP + streakBonus;

    // Update student
    await db.updateStudentLoginStreak(student.id, newStreak, now);
    await db.updateStudentCoins(student.id, coinsEarned);
    await db.updateStudentXP(student.id, xpEarned);

    // Check for level up
    const updatedStudent = await db.getStudentByUserId(ctx.user.id);
    if (updatedStudent) {
      const newLevel = Math.floor(updatedStudent.xp / 100) + 1;
      if (newLevel > updatedStudent.level) {
        await db.updateStudentLevel(student.id, newLevel);
      }
    }

    return {
      success: true,
      coinsEarned,
      xpEarned,
      loginStreak: newStreak,
    };
  }),

  // Get student stats
  getStats: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
    }
    
    return await db.getStudentStats(student.id);
  }),

  // Update login streak
  updateLoginStreak: studentProcedure.mutation(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
    }
    
    return { success: true };
  }),
});
