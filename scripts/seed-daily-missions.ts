import { db } from '../server/_core/db';
import { dailyMissions } from '../drizzle/schema';

async function seedDailyMissions() {
  console.log('Starting daily missions seeding...');

  const missions = [
    {
      title: 'もんだいを3もんとこう!',
      description: 'きょうのもんだいを3もんといてみよう',
      missionType: 'solve_problems',
      targetCount: 3,
      coinReward: 30,
      xpReward: 15,
      requiredLevel: 1,
    },
    {
      title: 'もんだいを5もんとこう!',
      description: 'きょうのもんだいを5もんといてみよう',
      missionType: 'solve_problems',
      targetCount: 5,
      coinReward: 50,
      xpReward: 25,
      requiredLevel: 1,
    },
    {
      title: 'ストーリーをよもう!',
      description: 'ストーリーを1つよんでみよう',
      missionType: 'read_story',
      targetCount: 1,
      coinReward: 20,
      xpReward: 10,
      requiredLevel: 1,
    },
    {
      title: 'ガチャをひこう!',
      description: 'ガチャを1かいひいてみよう',
      missionType: 'gacha_pull',
      targetCount: 1,
      coinReward: 10,
      xpReward: 5,
      requiredLevel: 1,
    },
    {
      title: 'ログインしよう!',
      description: 'まいにちログインしてボーナスをもらおう',
      missionType: 'daily_login',
      targetCount: 1,
      coinReward: 10,
      xpReward: 5,
      requiredLevel: 1,
    },
  ];

  try {
    for (const mission of missions) {
      await db.insert(dailyMissions).values(mission);
      console.log(`Created mission: ${mission.title}`);
    }

    console.log('Daily missions seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding daily missions:', error);
    throw error;
  }
}

// Run the seed function
seedDailyMissions()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
