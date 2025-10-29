import { router } from "../_core/trpc";
import { studentProcedure } from "./_procedures";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

export const gachaRouter = router({
  // Get student's items
  getMyItems: studentProcedure.query(async ({ ctx }) => {
    const student = await db.getStudentByUserId(ctx.user.id);
    if (!student) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
    }

    const items = await db.getStudentItemsWithDetails(student.id);
    return items;
  }),

  // Equip item
  equipItem: studentProcedure
    .input(z.object({ studentItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
      }

      await db.equipStudentItem(student.id, input.studentItemId);
      return { success: true };
    }),

  // Unequip item
  unequipItem: studentProcedure
    .input(z.object({ studentItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      if (!student) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not found' });
      }

      await db.unequipStudentItem(input.studentItemId);
      return { success: true };
    }),

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

    // Get all available items
    const allItems = await db.getAllCharacterItems();
    if (allItems.length === 0) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No items available' });
    }

    // Get student's owned items
    const ownedItems = await db.getStudentItems(student.id);
    const ownedItemIds = new Set(ownedItems.map((item: any) => item.itemId));

    // Filter out owned items
    const unownedItems = allItems.filter(item => !ownedItemIds.has(item.id));

    // If all items are owned, allow duplicates but give bonus coins
    const isDuplicate = unownedItems.length === 0;

    // Rarity weights
    const rarityWeights: Record<string, number> = {
      common: 0.60,    // 60%
      uncommon: 0.25,  // 25%
      rare: 0.10,      // 10%
      epic: 0.04,      // 4%
      legendary: 0.01, // 1%
    };

    // Roll for rarity
    const roll = Math.random();
    let cumulativeWeight = 0;
    let selectedRarity = 'common';

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      cumulativeWeight += weight;
      if (roll <= cumulativeWeight) {
        selectedRarity = rarity;
        break;
      }
    }

    // Use unowned items if available, otherwise allow duplicates
    const itemPool = isDuplicate ? allItems : unownedItems;

    // Filter items by rarity
    const itemsOfRarity = itemPool.filter(item => item.rarity === selectedRarity);
    
    // If no items of that rarity, fallback to common
    const availableItems = itemsOfRarity.length > 0 ? itemsOfRarity : itemPool.filter(item => item.rarity === 'common');
    
    // If still no items, use any item from pool
    const finalItems = availableItems.length > 0 ? availableItems : itemPool;
    
    // Select random item
    const selectedItem = finalItems[Math.floor(Math.random() * finalItems.length)];

    // Add item to student's inventory
    await db.addStudentItem(student.id, selectedItem.id);
    
    // Update daily mission progress
    await db.updateDailyMissionProgress(student.id, 'gacha_roll', 1);

    // If duplicate, give bonus coins
    let bonusCoins = 0;
    if (isDuplicate || ownedItemIds.has(selectedItem.id)) {
      // Bonus coins based on rarity
      const rarityBonusMap: Record<string, number> = {
        common: 5,
        uncommon: 10,
        rare: 20,
        epic: 50,
        legendary: 100,
      };
      bonusCoins = rarityBonusMap[selectedItem.rarity] || 5;
      await db.updateStudentCoins(student.id, bonusCoins);
    }

    return {
      item: selectedItem,
      rarity: selectedItem.rarity,
      isDuplicate: isDuplicate || ownedItemIds.has(selectedItem.id),
      bonusCoins,
    };
  }),
});
