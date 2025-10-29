import { router } from "../_core/trpc";
import { adminProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";

export const adminRouter = router({
  // Get OpenAI usage summary
  getOpenAIUsageSummary: adminProcedure.query(async () => {
    return await db.getOpenAIUsageSummary(); // Last 30 days by default
  }),

  // 全ての親子関係を取得
  getAllParentChildren: adminProcedure.query(async () => {
    return await db.getAllParentChildren();
  }),

  // 全ての保護者を取得
  getAllParents: adminProcedure.query(async () => {
    return await db.getAllParents();
  }),

  // 全ての生徒を詳細情報付きで取得
  getAllStudentsWithDetails: adminProcedure.query(async () => {
    return await db.getAllStudentsWithDetails();
  }),

  // 親子関係を追加
  addParentChild: adminProcedure
    .input(z.object({
      parentUserId: z.number(),
      studentId: z.number(),
      relationship: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.addParentChild(input.parentUserId, input.studentId, input.relationship);
    }),

  // 親子関係を削除
  removeParentChild: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await db.removeParentChild(input.id);
    }),
});
