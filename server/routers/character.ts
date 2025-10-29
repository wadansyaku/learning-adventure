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

      // 既存のキャラクターを確認
      const existingCharacter = await db.getCharacterByUserId(userId);
      if (existingCharacter) {
        throw new Error("すでにキャラクターがいるよ");
      }

      // キャラクター作成
      const character = await db.createCharacter({
        userId,
        name: input.name,
        animalType: input.animalType,
        imageUrl: input.imageUrl,
        level: 1,
        xp: 0,
      });

      return character;
    }),

  // 自分のキャラクター取得
  getMy: studentProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    return await db.getCharacterByUserId(userId);
  }),
});
