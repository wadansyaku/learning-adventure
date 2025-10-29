import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

// Import sub-routers
import { studentRouter } from "./routers/student";
import { teacherRouter } from "./routers/teacher";
import { parentRouter } from "./routers/parent";
import { adminRouter } from "./routers/admin";
import { taskRouter } from "./routers/task";
import { characterRouter } from './routers/character';
import { gachaRouter } from './routers/gacha';
import { problemRouter } from './routers/problem';
import { storyRouter } from './routers/story';
import { itemRouter, treasureRouter, achievementRouter, dailyMissionRouter, progressRouter } from './routers/misc';
import { badgeRouter } from './routers/badge';
import { rankingRouter } from './routers/ranking';
import { chatRouter } from './routers/chat';

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie('session', { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Switch role (for demo purposes)
    switchRole: protectedProcedure
      .input(z.object({ role: z.enum(['student', 'teacher', 'parent', 'admin']) }))
      .mutation(async ({ ctx, input }) => {
        // Update user role in database
        await db.updateUserRole(ctx.user.id, input.role);
        
        // If switching to student role, ensure student profile exists
        if (input.role === 'student') {
          const existingStudent = await db.getStudentByUserId(ctx.user.id);
          if (!existingStudent) {
            await db.createStudent({
              userId: ctx.user.id,
              displayName: ctx.user.name || '生徒',
              avatarIcon: '🐰',
              level: 1,
              xp: 0,
              coins: 0,
              loginStreak: 0,
            });
          }
        }
        
        return { success: true, role: input.role };
      }),
  }),

  // Sub-routers
  student: studentRouter,
  teacher: teacherRouter,
  parent: parentRouter,
  admin: adminRouter,
  task: taskRouter,
  character: characterRouter,
  gacha: gachaRouter,
  problem: problemRouter,
  story: storyRouter,
  badge: badgeRouter,
  ranking: rankingRouter,
  chat: chatRouter,
  item: itemRouter,
  treasure: treasureRouter,
  achievement: achievementRouter,
  dailyMission: dailyMissionRouter,
  progress: progressRouter,
});

export type AppRouter = typeof appRouter;
