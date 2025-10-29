import { router } from "../_core/trpc";
import { studentProcedure, teacherProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const taskRouter = router({
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
});
