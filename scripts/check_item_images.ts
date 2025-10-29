import * as db from '../server/db';

async function main() {
  console.log('=== CHARACTER ITEMS (all) ===');
  const charItems = await db.getAllCharacterItems();
  console.log(`Total items: ${charItems.length}\n`);
  
  charItems.forEach(item => {
    console.log(`ID: ${item.id}, Name: ${item.name}`);
    console.log(`  Image: ${item.imageUrl || 'NO IMAGE'}`);
    console.log(`  Rarity: ${item.rarity}\n`);
  });

  process.exit(0);
}

main().catch(console.error);
