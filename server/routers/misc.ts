import { router, publicProcedure } from "../_core/trpc";
import { studentProcedure } from "./_procedures";
import * as db from "../db";

// Miscellaneous routers: item, treasure, achievement, dailyMission, progress
export const itemRouter = router({
  // Get all available items
  getAll: publicProcedure.query(async () => {
    return await db.getAllCharacterItems();
  }),

  // Get student's items
  getMyItems: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) return [];
    
    return await db.getStudentItems(student.id);
  }),
});

export const treasureRouter = router({
  // Get student treasures
  getMyTreasures: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) return [];
    
    return await db.getStudentTreasures(student.id);
  }),
});

export const achievementRouter = router({
  // Get all achievements
  getAll: publicProcedure.query(async () => {
    return await db.getAllAchievements();
  }),

  // Get student achievements
  getMyAchievements: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) return [];
    
    return await db.getStudentAchievements(student.id);
  }),
});

export const dailyMissionRouter = router({
  // Get all active daily missions
  getAll: publicProcedure.query(async () => {
    return await db.getAllDailyMissions();
  }),

  // Get student's daily progress
  getMyProgress: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) return [];
    
    return await db.getStudentDailyProgress(student.id, new Date());
  }),
});

export const progressRouter = router({
  // Get student progress
  getMyProgress: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) return [];
    
    return await db.getStudentProgressByStudentId(student.id);
  }),
});
