import { drizzle } from "drizzle-orm/mysql2";
import { problems, storyChapters, treasures, achievements, characterItems } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed problems - 足し算
  const additionProblems = [
    { problemType: "addition" as const, difficulty: "easy" as const, question: "1 + 1 = ?", correctAnswer: "2", xpReward: 5, coinReward: 2 },
    { problemType: "addition" as const, difficulty: "easy" as const, question: "2 + 2 = ?", correctAnswer: "4", xpReward: 5, coinReward: 2 },
    { problemType: "addition" as const, difficulty: "easy" as const, question: "3 + 1 = ?", correctAnswer: "4", xpReward: 5, coinReward: 2 },
    { problemType: "addition" as const, difficulty: "easy" as const, question: "2 + 3 = ?", correctAnswer: "5", xpReward: 5, coinReward: 2 },
    { problemType: "addition" as const, difficulty: "easy" as const, question: "4 + 1 = ?", correctAnswer: "5", xpReward: 5, coinReward: 2 },
    { problemType: "addition" as const, difficulty: "medium" as const, question: "5 + 3 = ?", correctAnswer: "8", xpReward: 8, coinReward: 3 },
    { problemType: "addition" as const, difficulty: "medium" as const, question: "6 + 4 = ?", correctAnswer: "10", xpReward: 8, coinReward: 3 },
    { problemType: "addition" as const, difficulty: "medium" as const, question: "7 + 5 = ?", correctAnswer: "12", xpReward: 8, coinReward: 3 },
    { problemType: "addition" as const, difficulty: "hard" as const, question: "8 + 7 = ?", correctAnswer: "15", xpReward: 12, coinReward: 5 },
    { problemType: "addition" as const, difficulty: "hard" as const, question: "9 + 9 = ?", correctAnswer: "18", xpReward: 12, coinReward: 5 },
  ];

  // Seed problems - 引き算
  const subtractionProblems = [
    { problemType: "subtraction" as const, difficulty: "easy" as const, question: "3 - 1 = ?", correctAnswer: "2", xpReward: 5, coinReward: 2 },
    { problemType: "subtraction" as const, difficulty: "easy" as const, question: "4 - 2 = ?", correctAnswer: "2", xpReward: 5, coinReward: 2 },
    { problemType: "subtraction" as const, difficulty: "easy" as const, question: "5 - 3 = ?", correctAnswer: "2", xpReward: 5, coinReward: 2 },
    { problemType: "subtraction" as const, difficulty: "medium" as const, question: "10 - 4 = ?", correctAnswer: "6", xpReward: 8, coinReward: 3 },
    { problemType: "subtraction" as const, difficulty: "medium" as const, question: "12 - 5 = ?", correctAnswer: "7", xpReward: 8, coinReward: 3 },
    { problemType: "subtraction" as const, difficulty: "hard" as const, question: "15 - 8 = ?", correctAnswer: "7", xpReward: 12, coinReward: 5 },
    { problemType: "subtraction" as const, difficulty: "hard" as const, question: "18 - 9 = ?", correctAnswer: "9", xpReward: 12, coinReward: 5 },
  ];

  // Seed problems - 比較
  const comparisonProblems = [
    { problemType: "comparison" as const, difficulty: "easy" as const, question: "どちらがおおきい? 3 or 5", correctAnswer: "5", options: JSON.stringify(["3", "5"]), xpReward: 5, coinReward: 2 },
    { problemType: "comparison" as const, difficulty: "easy" as const, question: "どちらがちいさい? 2 or 7", correctAnswer: "2", options: JSON.stringify(["2", "7"]), xpReward: 5, coinReward: 2 },
    { problemType: "comparison" as const, difficulty: "medium" as const, question: "どちらがおおきい? 8 or 6", correctAnswer: "8", options: JSON.stringify(["8", "6"]), xpReward: 8, coinReward: 3 },
  ];

  console.log("📝 Inserting problems...");
  await db.insert(problems).values([...additionProblems, ...subtractionProblems, ...comparisonProblems]);

  // Seed story chapters
  const chapters = [
    {
      chapterNumber: 1,
      title: "はじまりのもり",
      description: "ふしぎなもりで、あたらしいぼうけんがはじまるよ!",
      requiredLevel: 1,
      xpReward: 50,
      coinReward: 20,
    },
    {
      chapterNumber: 2,
      title: "かわのむこうがわ",
      description: "かわをわたって、たからものをさがそう!",
      requiredLevel: 3,
      xpReward: 75,
      coinReward: 30,
    },
    {
      chapterNumber: 3,
      title: "やまのてっぺん",
      description: "たかいやまのうえには、なにがあるかな?",
      requiredLevel: 5,
      xpReward: 100,
      coinReward: 40,
    },
  ];

  console.log("📖 Inserting story chapters...");
  const insertedChapters = await db.insert(storyChapters).values(chapters);

  // Seed treasures
  const treasureData = [
    {
      name: "きんのコイン",
      description: "ぴかぴかひかる、きれいなコイン",
      chapterId: 1,
      rarity: "common" as const,
    },
    {
      name: "ぎんのほし",
      description: "よぞらにかがやく、ほしのかけら",
      chapterId: 1,
      rarity: "rare" as const,
    },
    {
      name: "にじのほうせき",
      description: "なないろにかがやく、ふしぎなほうせき",
      chapterId: 2,
      rarity: "epic" as const,
    },
    {
      name: "まほうのティアラ",
      description: "まほうのちからがやどる、すてきなティアラ",
      chapterId: 3,
      rarity: "legendary" as const,
    },
  ];

  console.log("💎 Inserting treasures...");
  await db.insert(treasures).values(treasureData);

  // Seed achievements
  const achievementData = [
    {
      name: "はじめのいっぽ",
      description: "はじめてもんだいをといたよ!",
      condition: JSON.stringify({ type: "first_problem" }),
      xpReward: 10,
      coinReward: 5,
    },
    {
      name: "れんぞくログイン",
      description: "3にちつづけてログインしたよ!",
      condition: JSON.stringify({ type: "login_streak", days: 3 }),
      xpReward: 20,
      coinReward: 10,
    },
    {
      name: "もんだいマスター",
      description: "10もんせいかいしたよ!",
      condition: JSON.stringify({ type: "correct_answers", count: 10 }),
      xpReward: 30,
      coinReward: 15,
    },
    {
      name: "レベルアップ!",
      description: "レベル5になったよ!",
      condition: JSON.stringify({ type: "reach_level", level: 5 }),
      xpReward: 50,
      coinReward: 25,
    },
  ];

  console.log("🏆 Inserting achievements...");
  await db.insert(achievements).values(achievementData);

  // Seed character items
  const itemData = [
    {
      name: "あかいリボン",
      itemType: "accessory" as const,
      imageUrl: "/items/red-ribbon.png",
      rarity: "common" as const,
      coinCost: 10,
    },
    {
      name: "あおいぼうし",
      itemType: "hat" as const,
      imageUrl: "/items/blue-hat.png",
      rarity: "common" as const,
      coinCost: 15,
    },
    {
      name: "きいろいワンピース",
      itemType: "outfit" as const,
      imageUrl: "/items/yellow-dress.png",
      rarity: "rare" as const,
      coinCost: 30,
    },
    {
      name: "むらさきのマント",
      itemType: "outfit" as const,
      imageUrl: "/items/purple-cape.png",
      rarity: "epic" as const,
      coinCost: 50,
    },
    {
      name: "にじのせかい",
      itemType: "background" as const,
      imageUrl: "/items/rainbow-world.png",
      rarity: "legendary" as const,
      coinCost: 100,
    },
  ];

  console.log("👗 Inserting character items...");
  await db.insert(characterItems).values(itemData);

  console.log("✅ Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
