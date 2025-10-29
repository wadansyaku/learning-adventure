import * as db from './server/db';

async function testInventory() {
  try {
    console.log('Testing getStudentItemsWithDetails...');
    
    // Test with student ID 1
    const items = await db.getStudentItemsWithDetails(1);
    
    console.log('Items found:', items.length);
    console.log('Items:', JSON.stringify(items, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testInventory();
