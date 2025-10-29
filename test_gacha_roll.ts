import * as db from './server/db';

async function testGachaRoll() {
  try {
    console.log('Testing gacha roll...');
    
    // Get all available items
    const allItems = await db.getAllCharacterItems();
    console.log('All items count:', allItems.length);
    console.log('First 3 items:', JSON.stringify(allItems.slice(0, 3), null, 2));
    
    // Get student's owned items
    const ownedItems = await db.getStudentItems(1);
    console.log('Owned items count:', ownedItems.length);
    
    const ownedItemIds = new Set(ownedItems.map((item: any) => item.itemId));
    console.log('Owned item IDs:', Array.from(ownedItemIds));
    
    // Filter out owned items
    const unownedItems = allItems.filter(item => !ownedItemIds.has(item.id));
    console.log('Unowned items count:', unownedItems.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testGachaRoll();
