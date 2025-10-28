import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { learningQuizzes, storyChapters } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log("🌱 Seeding learning quizzes...");

  // Get actual chapter IDs
  const chapters = await db.select().from(storyChapters).orderBy(storyChapters.chapterNumber);
  const chapterMap = new Map<number, number>();
  chapters.forEach(ch => chapterMap.set(ch.chapterNumber, ch.id));

  console.log("Chapter mapping:", Array.from(chapterMap.entries()));

  // 第1章: 数の概念(1-5)
  const chapter1Quizzes = [
    {
      chapterId: chapterMap.get(1)!,
      questionText: "うさぎさんが もっている にんじんは なんぼん?",
      questionType: "number_input" as const,
      correctAnswer: "3",
      options: null,
      explanation: "せいかい! にんじんは 3ぼん あるね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(1)!,
      questionText: "りすさんが もっている どんぐりは なんこ?",
      questionType: "number_input" as const,
      correctAnswer: "5",
      options: null,
      explanation: "すごい! どんぐりは 5こ あるよ!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(1)!,
      questionText: "1から5まで じゅんばんに ならべよう",
      questionType: "multiple_choice" as const,
      correctAnswer: "1, 2, 3, 4, 5",
      options: JSON.stringify(["1, 2, 3, 4, 5", "5, 4, 3, 2, 1", "1, 3, 2, 5, 4"]),
      explanation: "かんぺき! 1, 2, 3, 4, 5 の じゅんばんだね!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第2章: 数の概念(6-10)
  const chapter2Quizzes = [
    {
      chapterId: chapterMap.get(2)!,
      questionText: "かわに うかぶ いしは なんこ?",
      questionType: "number_input" as const,
      correctAnswer: "7",
      options: null,
      explanation: "せいかい! いしは 7こ あるね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(2)!,
      questionText: "7は どっち?",
      questionType: "multiple_choice" as const,
      correctAnswer: "7",
      options: JSON.stringify(["6", "7", "8"]),
      explanation: "よくできました! 7が わかったね!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(2)!,
      questionText: "りょうてで かぞえると いくつ?",
      questionType: "number_input" as const,
      correctAnswer: "10",
      options: null,
      explanation: "すばらしい! りょうてで 10 だね!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第3章: 足し算の基礎
  const chapter3Quizzes = [
    {
      chapterId: chapterMap.get(3)!,
      questionText: "1 + 2 = ?",
      questionType: "number_input" as const,
      correctAnswer: "3",
      options: null,
      explanation: "せいかい! 1と2を あわせると 3だね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(3)!,
      questionText: "2 + 3 = ?",
      questionType: "number_input" as const,
      correctAnswer: "5",
      options: null,
      explanation: "すごい! 2と3で 5に なるよ!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(3)!,
      questionText: "うさぎさんが 2こ、ねこさんが 3こ もっています。あわせて なんこ?",
      questionType: "number_input" as const,
      correctAnswer: "5",
      options: null,
      explanation: "かんぺき! 2 + 3 = 5 だね!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第4章: 引き算の基礎
  const chapter4Quizzes = [
    {
      chapterId: chapterMap.get(4)!,
      questionText: "5 - 2 = ?",
      questionType: "number_input" as const,
      correctAnswer: "3",
      options: null,
      explanation: "せいかい! 5から2を とると 3だね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(4)!,
      questionText: "4 - 1 = ?",
      questionType: "number_input" as const,
      correctAnswer: "3",
      options: null,
      explanation: "よくできました! 4から1を とると 3だよ!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(4)!,
      questionText: "5この ケーキが ありました。3こ たべました。のこりは?",
      questionType: "number_input" as const,
      correctAnswer: "2",
      options: null,
      explanation: "すばらしい! 5 - 3 = 2 だね!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第5章: 10までの足し算
  const chapter5Quizzes = [
    {
      chapterId: chapterMap.get(5)!,
      questionText: "7 + 3 = ?",
      questionType: "number_input" as const,
      correctAnswer: "10",
      options: null,
      explanation: "せいかい! 7と3で 10に なるね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(5)!,
      questionText: "4 + 6 = ?",
      questionType: "number_input" as const,
      correctAnswer: "10",
      options: null,
      explanation: "すごい! 4と6で 10だよ!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(5)!,
      questionText: "10に なる くみあわせは どれ?",
      questionType: "multiple_choice" as const,
      correctAnswer: "5 + 5",
      options: JSON.stringify(["3 + 4", "5 + 5", "6 + 3"]),
      explanation: "かんぺき! 5 + 5 = 10 だね!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第6章: 10までの引き算
  const chapter6Quizzes = [
    {
      chapterId: chapterMap.get(6)!,
      questionText: "10 - 3 = ?",
      questionType: "number_input" as const,
      correctAnswer: "7",
      options: null,
      explanation: "せいかい! 10から3を とると 7だね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(6)!,
      questionText: "9 - 4 = ?",
      questionType: "number_input" as const,
      correctAnswer: "5",
      options: null,
      explanation: "よくできました! 9から4を とると 5だよ!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(6)!,
      questionText: "10この ほしが ありました。7こ おちました。のこりは?",
      questionType: "number_input" as const,
      correctAnswer: "3",
      options: null,
      explanation: "すばらしい! 10 - 7 = 3 だね!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第7章: 大小比較
  const chapter7Quizzes = [
    {
      chapterId: chapterMap.get(7)!,
      questionText: "5と3、どっちが おおきい?",
      questionType: "multiple_choice" as const,
      correctAnswer: "5",
      options: JSON.stringify(["5", "3", "おなじ"]),
      explanation: "せいかい! 5のほうが おおきいね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(7)!,
      questionText: "7と9、どっちが ちいさい?",
      questionType: "multiple_choice" as const,
      correctAnswer: "7",
      options: JSON.stringify(["7", "9", "おなじ"]),
      explanation: "よくできました! 7のほうが ちいさいよ!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(7)!,
      questionText: "2, 5, 8を ちいさい じゅんに ならべよう",
      questionType: "multiple_choice" as const,
      correctAnswer: "2, 5, 8",
      options: JSON.stringify(["2, 5, 8", "8, 5, 2", "5, 2, 8"]),
      explanation: "かんぺき! 2, 5, 8の じゅんだね!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第8章: 図形の基礎
  const chapter8Quizzes = [
    {
      chapterId: chapterMap.get(8)!,
      questionText: "これは なんの かたち? ⚪",
      questionType: "multiple_choice" as const,
      correctAnswer: "まる",
      options: JSON.stringify(["まる", "さんかく", "しかく"]),
      explanation: "せいかい! まる だね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(8)!,
      questionText: "これは なんの かたち? △",
      questionType: "multiple_choice" as const,
      correctAnswer: "さんかく",
      options: JSON.stringify(["まる", "さんかく", "しかく"]),
      explanation: "よくできました! さんかく だよ!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(8)!,
      questionText: "これは なんの かたち? ◻",
      questionType: "multiple_choice" as const,
      correctAnswer: "しかく",
      options: JSON.stringify(["まる", "さんかく", "しかく"]),
      explanation: "すばらしい! しかく だね!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第9章: 時計の読み方
  const chapter9Quizzes = [
    {
      chapterId: chapterMap.get(9)!,
      questionText: "みじかい はりが 3を さしています。なんじ?",
      questionType: "number_input" as const,
      correctAnswer: "3",
      options: null,
      explanation: "せいかい! 3じ だね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(9)!,
      questionText: "7じの とけいを えらぼう",
      questionType: "multiple_choice" as const,
      correctAnswer: "7じ",
      options: JSON.stringify(["5じ", "7じ", "9じ"]),
      explanation: "よくできました! 7じが わかったね!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(9)!,
      questionText: "みじかい はりが 12を さすと なんじ?",
      questionType: "number_input" as const,
      correctAnswer: "12",
      options: null,
      explanation: "かんぺき! 12じ だよ!",
      imageUrl: "",
      orderIndex: 3,
    },
  ];

  // 第10章: 総合復習
  const chapter10Quizzes = [
    {
      chapterId: chapterMap.get(10)!,
      questionText: "5 + 3 = ?",
      questionType: "number_input" as const,
      correctAnswer: "8",
      options: null,
      explanation: "せいかい! たしざんが できるね!",
      imageUrl: "",
      orderIndex: 1,
    },
    {
      chapterId: chapterMap.get(10)!,
      questionText: "10 - 4 = ?",
      questionType: "number_input" as const,
      correctAnswer: "6",
      options: null,
      explanation: "よくできました! ひきざんも できるよ!",
      imageUrl: "",
      orderIndex: 2,
    },
    {
      chapterId: chapterMap.get(10)!,
      questionText: "7と9、どっちが おおきい?",
      questionType: "multiple_choice" as const,
      correctAnswer: "9",
      options: JSON.stringify(["7", "9", "おなじ"]),
      explanation: "すばらしい! くらべることも できるね!",
      imageUrl: "",
      orderIndex: 3,
    },
    {
      chapterId: chapterMap.get(10)!,
      questionText: "これは なんの かたち? ⚪",
      questionType: "multiple_choice" as const,
      correctAnswer: "まる",
      options: JSON.stringify(["まる", "さんかく", "しかく"]),
      explanation: "かんぺき! かたちも わかるよ!",
      imageUrl: "",
      orderIndex: 4,
    },
    {
      chapterId: chapterMap.get(10)!,
      questionText: "みじかい はりが 5を さしています。なんじ?",
      questionType: "number_input" as const,
      correctAnswer: "5",
      options: null,
      explanation: "すごい! とけいも よめるね! ぜんぶ できたよ!",
      imageUrl: "",
      orderIndex: 5,
    },
  ];

  const allQuizzes = [
    ...chapter1Quizzes,
    ...chapter2Quizzes,
    ...chapter3Quizzes,
    ...chapter4Quizzes,
    ...chapter5Quizzes,
    ...chapter6Quizzes,
    ...chapter7Quizzes,
    ...chapter8Quizzes,
    ...chapter9Quizzes,
    ...chapter10Quizzes,
  ];

  console.log(`Inserting ${allQuizzes.length} learning quizzes...`);
  
  for (const quiz of allQuizzes) {
    await db.insert(learningQuizzes).values(quiz);
  }

  console.log("✅ Learning quizzes seeded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error seeding learning quizzes:", error);
    process.exit(1);
  });
