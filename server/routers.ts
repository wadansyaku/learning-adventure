import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Role-based procedures
const teacherProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'teacher' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Teacher access required' });
  }
  return next({ ctx });
});

const studentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'student' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Student access required' });
  }
  return next({ ctx });
});

const parentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'parent' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Parent access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
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

  // Student router
  student: router({
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

      // Calculate bonus based on streak
      const baseCoins = 10;
      const baseXP = 5;
      const streakBonus = Math.min(student.loginStreak, 7); // Max 7 days bonus
      
      return {
        eligible: true,
        loginStreak: student.loginStreak + 1,
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
  }),

  // Character router
  character: router({
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
  }),

  // Task router
  task: router({
    // Get tasks for student
    getMyTasks: studentProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      
      return await db.getTasksByStudentId(student.id);
    }),

    // Get tasks created by teacher
    getTeacherTasks: teacherProcedure.query(async ({ ctx }) => {
      return await db.getTasksByTeacherId(ctx.user.id);
    }),

    // Create task (teacher only)
    create: teacherProcedure
      .input(z.object({
        studentId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        taskType: z.enum(['school_homework', 'app_problem']),
        difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
        xpReward: z.number().default(10),
        coinReward: z.number().default(5),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createTask({
          studentId: input.studentId,
          teacherId: ctx.user.id,
          title: input.title,
          description: input.description,
          taskType: input.taskType,
          difficulty: input.difficulty,
          xpReward: input.xpReward,
          coinReward: input.coinReward,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });
        
        return { success: true };
      }),

    // Complete task
    complete: studentProcedure
      .input(z.object({
        taskId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const student = await db.getStudentByUserId(ctx.user.id);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
        }
        
        // Get task to get rewards
        const tasks = await db.getTasksByStudentId(student.id);
        const task = tasks.find(t => t.id === input.taskId);
        
        if (!task) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
        }
        
        // Update task status
        await db.updateTaskStatus(input.taskId, 'completed');
        
        // Award XP and coins
        await db.updateStudentXP(student.id, task.xpReward || 10);
        await db.updateStudentCoins(student.id, task.coinReward || 5);
        
        // Check for level up (100 XP per level)
        const updatedStudent = await db.getStudentByUserId(ctx.user.id);
        if (updatedStudent) {
          const newLevel = Math.floor(updatedStudent.xp / 100) + 1;
          if (newLevel > updatedStudent.level) {
            await db.updateStudentLevel(student.id, newLevel);
          }
        }
        
        return { success: true, xpEarned: task.xpReward, coinsEarned: task.coinReward };
      }),
  }),

  // Problem router
  problem: router({
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
  }),

  // Progress router
  progress: router({
    // Get student progress
    getMyProgress: studentProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      
      return await db.getStudentProgressByStudentId(student.id);
    }),
  }),

  // Story router
  story: router({
    // Get all chapters
    getChapters: publicProcedure.query(async () => {
      return await db.getAllStoryChapters();
    }),

    // Get student story progress
    getMyProgress: studentProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      
      return await db.getStudentStoryProgress(student.id);
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

        return { 
          success: true, 
          xpEarned: chapter.xpReward, 
          coinsEarned: chapter.coinReward 
        };
      }),
  }),

  // Treasure router
  treasure: router({
    // Get student treasures
    getMyTreasures: studentProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) return [];
      
      return await db.getStudentTreasures(student.id);
    }),
  }),

  // Achievement router
  achievement: router({
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
  }),

  // Teacher router
  teacher: router({
    // Get all students
    getAllStudents: teacherProcedure.query(async () => {
      return await db.getAllStudents();
    }),

    // Get student details
    getStudentDetails: teacherProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
        }
        return student;
      }),

    // Get student progress
    getStudentProgress: teacherProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStudentProgressByStudentId(input.studentId);
      }),
  }),

  // Item router
  item: router({
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
  }),

  // Gacha router
  gacha: router({
    // Roll gacha
    roll: studentProcedure.mutation(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
      }

      // Check if student has enough coins
      if (student.coins < 10) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'コインがたりないよ!' });
      }

      // Deduct coins
      await db.updateStudentCoins(student.id, -10);

      // Get all items
      const allItems = await db.getAllCharacterItems();
      if (allItems.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No items available' });
      }

      // Gacha logic with rarity weights
      const rarityWeights: Record<string, number> = {
        common: 60,
        rare: 30,
        epic: 9,
        legendary: 1,
      };

      // Calculate total weight
      const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
      
      // Random roll
      const roll = Math.random() * totalWeight;
      let cumulativeWeight = 0;
      let selectedRarity = 'common';

      for (const [rarity, weight] of Object.entries(rarityWeights)) {
        cumulativeWeight += weight;
        if (roll <= cumulativeWeight) {
          selectedRarity = rarity;
          break;
        }
      }

      // Filter items by rarity
      const itemsOfRarity = allItems.filter(item => item.rarity === selectedRarity);
      
      // If no items of that rarity, fallback to common
      const availableItems = itemsOfRarity.length > 0 ? itemsOfRarity : allItems.filter(item => item.rarity === 'common');
      
      // If still no items, use any item
      const finalItems = availableItems.length > 0 ? availableItems : allItems;
      
      // Select random item
      const selectedItem = finalItems[Math.floor(Math.random() * finalItems.length)];

      // Add item to student's inventory
      await db.addStudentItem(student.id, selectedItem.id);

      return {
        item: selectedItem,
        rarity: selectedItem.rarity,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
