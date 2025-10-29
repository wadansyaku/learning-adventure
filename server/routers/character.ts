import { router } from "../_core/trpc";
import { studentProcedure } from "./_procedures";
import { z } from "zod";
import * as db from "../db";

export const characterRouter = router({
  // キャラクタータイプ一覧取得
  getAllTypes: studentProcedure.query(async () => {
    return await db.getAllCharacterTypes();
  }),

  // キャラクター作成
  create: studentProcedure
    .input(
      z.object({
        name: z.string(),
        animalType: z.string(),
        imageUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // userIdからstudentIdを取得
      const student = await db.getStudentByUserId(userId);
      if (!student) {
        throw new Error("生徒プロフィールが見つかりません");
      }

      // 既存のキャラクターを確認
      const existingCharacters = await db.getCharactersByStudentId(student.id);
      if (existingCharacters && existingCharacters.length > 0) {
        throw new Error("すでにキャラクターがいるよ");
      }

      // キャラクター作成
      const character = await db.createCharacter({
        studentId: student.id,
        name: input.name,
        animalType: input.animalType,
        imageUrl: input.imageUrl,
        level: 1,
        affection: 0,
        isActive: true,
      });

      return character;
    }),

  // 自分のキャラクター取得
  getMy: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    // userIdからstudentIdを取得
    const student = await db.getStudentByUserId(userId);
    if (!student) {
      return null;
    }
    
    const characters = await db.getCharactersByStudentId(student.id);
    return characters && characters.length > 0 ? characters[0] : null;
  }),
});
