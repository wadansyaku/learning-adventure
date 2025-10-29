import { getDb } from '../server/db';
import { badges } from '../drizzle/schema';

async function seedBadges() {
  const db = await getDb();
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  console.log('Seeding badges...');

  const badgeData = [
    // Common badges
    {
      name: 'はじめのいっぽ',
      description: 'はじめてログインしたよ！',
      icon: '🌟',
      rarity: 'common' as const,
      condition: JSON.stringify({ type: 'first_login' }),
    },
    {
      name: 'もんだいチャレンジャー',
      description: 'もんだいを5こといたよ！',
      icon: '📝',
      rarity: 'common' as const,
      condition: JSON.stringify({ type: 'problems_solved', count: 5 }),
    },
    {
      name: 'コインコレクター',
      description: 'コインを100まいあつめたよ！',
      icon: '🪙',
      rarity: 'common' as const,
      condition: JSON.stringify({ type: 'coins_earned', count: 100 }),
    },
    
    // Rare badges
    {
      name: 'もんだいマスター',
      description: 'もんだいを50こといたよ！',
      icon: '📚',
      rarity: 'rare' as const,
      condition: JSON.stringify({ type: 'problems_solved', count: 50 }),
    },
    {
      name: 'れんぞくログイン',
      description: '7にちれんぞくでログインしたよ！',
      icon: '🔥',
      rarity: 'rare' as const,
      condition: JSON.stringify({ type: 'login_streak', days: 7 }),
    },
    {
      name: 'ジェムハンター',
      description: 'ジェムを50こあつめたよ！',
      icon: '💎',
      rarity: 'rare' as const,
      condition: JSON.stringify({ type: 'gems_earned', count: 50 }),
    },
    
    // Epic badges
    {
      name: 'レベルアップヒーロー',
      description: 'レベル10になったよ！',
      icon: '🏆',
      rarity: 'epic' as const,
      condition: JSON.stringify({ type: 'level_reached', level: 10 }),
    },
    {
      name: 'クエストヒーロー',
      description: 'スペシャルクエストを10こクリアしたよ！',
      icon: '⚔️',
      rarity: 'epic' as const,
      condition: JSON.stringify({ type: 'quests_completed', count: 10 }),
    },
    {
      name: 'ストーリーマスター',
      description: 'ストーリーを5こクリアしたよ！',
      icon: '📖',
      rarity: 'epic' as const,
      condition: JSON.stringify({ type: 'stories_completed', count: 5 }),
    },
    
    // Legendary badges
    {
      name: 'でんせつのがくしゃ',
      description: 'レベル50になったよ！すごい！',
      icon: '👑',
      rarity: 'legendary' as const,
      condition: JSON.stringify({ type: 'level_reached', level: 50 }),
    },
    {
      name: 'パーフェクトマスター',
      description: 'もんだいを100こといたよ！',
      icon: '🌈',
      rarity: 'legendary' as const,
      condition: JSON.stringify({ type: 'problems_solved', count: 100 }),
    },
    {
      name: 'ジェムレジェンド',
      description: 'ジェムを500こあつめたよ！',
      icon: '💠',
      rarity: 'legendary' as const,
      condition: JSON.stringify({ type: 'gems_earned', count: 500 }),
    },
  ];

  for (const badge of badgeData) {
    await db.insert(badges).values(badge);
  }

  console.log(`Seeded ${badgeData.length} badges successfully!`);
  process.exit(0);
}

seedBadges().catch(console.error);
