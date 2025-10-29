import { router } from "../_core/trpc";
import { studentProcedure } from "./_procedures";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const gachaRouter = router({
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
    
    // Update daily mission progress
    await db.updateDailyMissionProgress(student.id, 'gacha_roll', 1);

    return {
      item: selectedItem,
      rarity: selectedItem.rarity,
    };
  }),
});
