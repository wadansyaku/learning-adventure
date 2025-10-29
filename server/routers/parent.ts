import { router } from "../_core/trpc";
import { parentProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";

export const parentRouter = router({
  // Get children by parent user ID
  getMyChildren: parentProcedure.query(async ({ ctx }) => {
    return await db.getChildrenByParentUserId(ctx.user.id);
  }),

  // Add child relationship
  addChild: parentProcedure
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await db.addParentChildRelationship(ctx.user.id, input.studentId);
    }),

  // Remove child relationship
  removeChild: parentProcedure
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await db.removeParentChildRelationship(ctx.user.id, input.studentId);
    }),

  // Get child's progress
  getChildProgress: parentProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getStudentProgressByStudentId(input.studentId);
    }),

  // Get child's achievements
  getChildAchievements: parentProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getStudentAchievements(input.studentId);
    }),

  // Get child's weekly data
  getChildWeeklyData: parentProcedure
    .input(z.object({ childId: z.number() }))
    .query(async ({ input }) => {
      return await db.getChildWeeklyData(input.childId);
    }),

  // Get child's skill data
  getChildSkillData: parentProcedure
    .input(z.object({ childId: z.number() }))
    .query(async ({ input }) => {
      return await db.getChildSkillData(input.childId);
    }),

  // Get child's recent activities
  getChildRecentActivities: parentProcedure
    .input(z.object({ childId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await db.getChildRecentActivities(input.childId, input.limit);
    }),
});
