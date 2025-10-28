import { drizzle } from "drizzle-orm/mysql2";
import { 
  problems, 
  characterItems, 
  achievements, 
  storyChapters, 
  treasures 
} from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function generateExtendedSeedData() {
  console.log("🌱 Generating extended seed data...");

  // 1. Generate 500 math problems
  console.log("📝 Generating 500 math problems...");
  const problemsData = [];
  
  for (let i = 1; i <= 500; i++) {
    const type = ['addition', 'subtraction', 'comparison'][i % 3];
    let question, correctAnswer, options;

    if (type === 'addition') {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      question = `${a} + ${b} =`;
      correctAnswer = (a + b).toString();
      options = JSON.stringify([
        correctAnswer,
        (a + b + 1).toString(),
        (a + b - 1).toString(),
        (a + b + 2).toString(),
      ].sort(() => Math.random() - 0.5));
    } else if (type === 'subtraction') {
      const a = Math.floor(Math.random() * 20) + 10;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      question = `${a} - ${b} =`;
      correctAnswer = (a - b).toString();
      options = JSON.stringify([
        correctAnswer,
        (a - b + 1).toString(),
        (a - b - 1).toString(),
        (a - b + 2).toString(),
      ].sort(() => Math.random() - 0.5));
    } else {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      question = `${a} と ${b}、どっちがおおきい?`;
      correctAnswer = a > b ? a.toString() : b.toString();
      options = JSON.stringify([a.toString(), b.toString()]);
    }

    const difficulty = i <= 200 ? 'easy' : i <= 400 ? 'medium' : 'hard';
    const xpReward = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
    const coinReward = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;

    problemsData.push({
      type,
      question,
      correctAnswer,
      options,
      difficulty,
      xpReward,
      coinReward,
    });
  }

  await db.insert(problems).values(problemsData);
  console.log("✅ 500 problems generated!");

  // 2. Generate 100 character items
  console.log("🎨 Generating 100 character items...");
  const itemsData = [];
  const itemTypes = ['hat', 'outfit', 'accessory', 'background'];
  const rarities = ['common', 'rare', 'epic', 'legendary'];
  
  const itemNames = {
    hat: ['ぼうし', 'リボン', 'おうかん', 'ヘッドホン', 'はな'],
    outfit: ['ふく', 'ドレス', 'よろい', 'マント', 'ユニフォーム'],
    accessory: ['めがね', 'ネックレス', 'てぶくろ', 'くつ', 'かばん'],
    background: ['もり', 'うみ', 'そら', 'うちゅう', 'しろ'],
  };

  const colors = ['あか', 'あお', 'きいろ', 'みどり', 'むらさき', 'ピンク', 'しろ', 'くろ'];
  const adjectives = ['かわいい', 'かっこいい', 'きれいな', 'ふしぎな', 'まほうの', 'きらきら', 'ふわふわ'];

  for (let i = 0; i < 100; i++) {
    const itemType = itemTypes[i % itemTypes.length];
    const rarity = rarities[Math.floor(i / 25)]; // 25 items per rarity
    const baseName = itemNames[itemType][Math.floor(Math.random() * itemNames[itemType].length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const name = `${adjective}${color}の${baseName}`;
    const description = `${adjective}${baseName}だよ!`;
    const icon = ['🏪', '👕', '👓', '🌈'][itemTypes.indexOf(itemType)];

    itemsData.push({
      name,
      description,
      icon,
      itemType,
      rarity,
      imageUrl: '',
    });
  }

  await db.insert(characterItems).values(itemsData);
  console.log("✅ 100 character items generated!");

  // 3. Generate 20 achievements
  console.log("🏆 Generating 20 achievements...");
  const achievementsData = [
    { name: 'はじめのいっぽ', description: 'さいしょのもんだいをといたよ!', iconUrl: '🎯', condition: 'solve_1_problem', xpReward: 50, coinReward: 20, rarity: 'common' },
    { name: '10もんクリア', description: '10このもんだいをといたよ!', iconUrl: '⭐', condition: 'solve_10_problems', xpReward: 100, coinReward: 50, rarity: 'common' },
    { name: '50もんクリア', description: '50このもんだいをといたよ!', iconUrl: '🌟', condition: 'solve_50_problems', xpReward: 200, coinReward: 100, rarity: 'rare' },
    { name: '100もんクリア', description: '100このもんだいをといたよ!', iconUrl: '💫', condition: 'solve_100_problems', xpReward: 500, coinReward: 250, rarity: 'epic' },
    { name: 'パーフェクト', description: '10もんれんぞくでせいかいしたよ!', iconUrl: '🎊', condition: 'streak_10', xpReward: 300, coinReward: 150, rarity: 'rare' },
    { name: 'レベル5', description: 'レベル5になったよ!', iconUrl: '🔥', condition: 'reach_level_5', xpReward: 100, coinReward: 50, rarity: 'common' },
    { name: 'レベル10', description: 'レベル10になったよ!', iconUrl: '⚡', condition: 'reach_level_10', xpReward: 300, coinReward: 150, rarity: 'rare' },
    { name: 'レベル20', description: 'レベル20になったよ!', iconUrl: '💎', condition: 'reach_level_20', xpReward: 1000, coinReward: 500, rarity: 'epic' },
    { name: 'まいにちがんばる', description: '7にちれんぞくでログインしたよ!', iconUrl: '📅', condition: 'login_streak_7', xpReward: 200, coinReward: 100, rarity: 'rare' },
    { name: 'つづけるちから', description: '30にちれんぞくでログインしたよ!', iconUrl: '🏅', condition: 'login_streak_30', xpReward: 1000, coinReward: 500, rarity: 'epic' },
    { name: 'おかねもち', description: '1000コインためたよ!', iconUrl: '💰', condition: 'earn_1000_coins', xpReward: 300, coinReward: 0, rarity: 'rare' },
    { name: 'だいふごう', description: '5000コインためたよ!', iconUrl: '💎', condition: 'earn_5000_coins', xpReward: 1000, coinReward: 0, rarity: 'epic' },
    { name: 'ガチャマスター', description: 'ガチャも50かいひいたよ!', iconUrl: '🎰', condition: 'gacha_50_times', xpReward: 500, coinReward: 250, rarity: 'rare' },
    { name: 'コレクター', description: 'アイテムも50こあつめたよ!', iconUrl: '🎁', condition: 'collect_50_items', xpReward: 500, coinReward: 250, rarity: 'rare' },
    { name: 'ぼうけんしゃ', description: 'ストーリーを5しょうクリアしたよ!', iconUrl: '🗺️', condition: 'complete_5_chapters', xpReward: 500, coinReward: 250, rarity: 'rare' },
    { name: 'でんせつのゆうしゃ', description: 'すべてのストーリーをクリアしたよ!', iconUrl: '👑', condition: 'complete_all_chapters', xpReward: 2000, coinReward: 1000, rarity: 'legendary' },
    { name: 'たしざんマスター', description: 'たしざんを100もんといたよ!', iconUrl: '➕', condition: 'solve_100_addition', xpReward: 300, coinReward: 150, rarity: 'rare' },
    { name: 'ひきざんマスター', description: 'ひきざんを100もんといたよ!', iconUrl: '➖', condition: 'solve_100_subtraction', xpReward: 300, coinReward: 150, rarity: 'rare' },
    { name: 'さんすうてんさい', description: 'すべてのもんだいタイプをマスターしたよ!', iconUrl: '🧮', condition: 'master_all_types', xpReward: 1000, coinReward: 500, rarity: 'epic' },
    { name: 'きせき', description: 'すべてのじっせきをかくとくしたよ!', iconUrl: '🌈', condition: 'unlock_all_achievements', xpReward: 5000, coinReward: 2500, rarity: 'legendary' },
  ];

  await db.insert(achievements).values(achievementsData);
  console.log("✅ 20 achievements generated!");

  // 4. Story chapters already exist from seed.ts, skipping
  console.log("✅ Story chapters already exist (from seed.ts), skipping...");

  // 5. Generate 30 treasures (after story chapters due to foreign key)
  console.log("💎 Generating 30 treasures...");
  
  // Get existing story chapters
  const existingChapters = await db.select().from(storyChapters).orderBy(storyChapters.chapterNumber).limit(10);
  
  if (existingChapters.length < 10) {
    console.error("❌ Not enough story chapters found. Expected 10, found", existingChapters.length);
    return;
  }
  
  const treasuresData = [];
  const treasureNames = [
    'きんのコイン', 'ぎんのコイン', 'ダイヤモンド', 'ルビー', 'サファイア',
    'エメラルド', 'しんじゅ', 'おうかん', 'まほうのつえ', 'でんせつのけん',
    'ドラゴンのたまご', 'ほしのかけら', 'にじのいし', 'こおりのクリスタル', 'ほのおのたま',
    'かぜのはね', 'つちのたて', 'みずのしずく', 'ひかりのたま', 'やみのいし',
    'じかんのすな', 'くうかんのかぎ', 'いのちのみ', 'ちえのほん', 'ゆうきのメダル',
    'やさしさのはな', 'ゆめのかけら', 'きぼうのひかり', 'あいのけっしょう', 'えいえんのほうせき',
  ];

  for (let i = 0; i < 30; i++) {
    const chapterIndex = i % 10;
    const chapterId = existingChapters[chapterIndex].id;
    const rarity = i < 10 ? 'common' : i < 20 ? 'rare' : i < 28 ? 'epic' : 'legendary';
    
    treasuresData.push({
      name: treasureNames[i],
      description: `${treasureNames[i]}を みつけたよ!`,
      imageUrl: null,
      chapterId,
      rarity,
    });
  }

  await db.insert(treasures).values(treasuresData);
  console.log("✅ 30 treasures generated!");

  console.log("🎉 Extended seed data generation complete!");
}

generateExtendedSeedData()
  .then(() => {
    console.log("✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
