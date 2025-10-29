import { router } from "../_core/trpc";
import { teacherProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const teacherRouter = router({
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

  // Get teacher's students
  getMyStudents: teacherProcedure.query(async ({ ctx }) => {
    const teacher = await db.getTeacherByUserId(ctx.user.id);
    if (!teacher) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher not found' });
    }
    return await db.getTeacherStudents(teacher.id);
  }),

  // Add student to teacher
  addStudent: teacherProcedure
    .input(z.object({ studentId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher not found' });
      }
      return await db.addTeacherStudent(teacher.id, input.studentId, input.notes);
    }),

  // Remove student from teacher
  removeStudent: teacherProcedure
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher not found' });
      }
      return await db.removeTeacherStudent(teacher.id, input.studentId);
    }),

  // Update student notes
  updateStudentNotes: teacherProcedure
    .input(z.object({ studentId: z.number(), notes: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const teacher = await db.getTeacherByUserId(ctx.user.id);
      if (!teacher) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Teacher not found' });
      }
      return await db.updateTeacherStudentNotes(teacher.id, input.studentId, input.notes);
    }),
});
