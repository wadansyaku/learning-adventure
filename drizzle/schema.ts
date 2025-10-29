import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role field for student, teacher, and parent roles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["student", "teacher", "parent", "admin"]).default("student").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Students table - extends user with student-specific data
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  displayName: varchar("displayName", { length: 100 }).notNull(), // ひらがな表示名
  avatarIcon: varchar("avatarIcon", { length: 255 }), // アイコン画像URL
  level: int("level").default(1).notNull(),
  xp: int("xp").default(0).notNull(),
  coins: int("coins").default(0).notNull(),
  gems: int("gems").default(0).notNull(), // ジェム（プレミアム通貨）
  currentCharacterId: int("currentCharacterId"), // 現在のキャラクターID
  loginStreak: int("loginStreak").default(0).notNull(), // 連続ログイン日数
  lastLoginDate: datetime("lastLoginDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Character Types table - キャラクターマスターデータ
 */
export const characterTypes = mysqlTable("characterTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // キャラクター名(ひらがな)
  species: varchar("species", { length: 50 }).notNull(), // 動物の種類(英語)
  description: text("description").notNull(), // 説明(ひらがな)
  imageUrl: varchar("imageUrl", { length: 255 }).notNull(), // キャラクター画像URL
  personality: varchar("personality", { length: 100 }), // 性格
  unlockLevel: int("unlockLevel").default(1).notNull(), // 解放レベル
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CharacterType = typeof characterTypes.$inferSelect;
export type InsertCharacterType = typeof characterTypes.$inferInsert;

/**
 * Characters table - 2D animal characters (生徒ごとのインスタンス)
 */
export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  name: varchar("name", { length: 100 }).notNull(), // キャラクター名
  animalType: varchar("animalType", { length: 50 }).notNull(), // 動物の種類
  imageUrl: varchar("imageUrl", { length: 255 }).notNull(), // キャラクター画像URL
  level: int("level").default(1).notNull(),
  affection: int("affection").default(0).notNull(), // 絆レベル
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

/**
 * Character items - 着せ替えアイテム
 */
export const characterItems = mysqlTable("characterItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  itemType: mysqlEnum("itemType", ["outfit", "accessory", "hat", "background"]).notNull(),
  imageUrl: varchar("imageUrl", { length: 255 }).notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  coinCost: int("coinCost").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CharacterItem = typeof characterItems.$inferSelect;
export type InsertCharacterItem = typeof characterItems.$inferInsert;

/**
 * Student items - 生徒が所有するアイテム
 */
export const studentItems = mysqlTable("studentItems", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  itemId: int("itemId").notNull().references(() => characterItems.id),
  characterId: int("characterId").references(() => characters.id), // どのキャラクターに装備しているか
  isEquipped: boolean("isEquipped").default(false).notNull(),
  acquiredAt: timestamp("acquiredAt").defaultNow().notNull(),
});

export type StudentItem = typeof studentItems.$inferSelect;
export type InsertStudentItem = typeof studentItems.$inferInsert;

/**
 * Tasks - 講師が設定する課題
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  teacherId: int("teacherId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  taskType: mysqlEnum("taskType", ["school_homework", "app_problem"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(), // レアリティ
  xpReward: int("xpReward").default(10).notNull(),
  coinReward: int("coinReward").default(5).notNull(),
  gemReward: int("gemReward").default(1).notNull(), // ジェム報酬
  dueDate: datetime("dueDate"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  completedAt: datetime("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Problems - アプリ内の問題
 */
export const problems = mysqlTable("problems", {
  id: int("id").autoincrement().primaryKey(),
  problemType: mysqlEnum("problemType", ["addition", "subtraction", "comparison", "pattern", "shape"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("easy").notNull(),
  question: text("question").notNull(),
  correctAnswer: varchar("correctAnswer", { length: 255 }).notNull(),
  options: text("options"), // JSON array of options
  imageUrl: varchar("imageUrl", { length: 255 }), // 問題に使用する画像
  xpReward: int("xpReward").default(5).notNull(),
  coinReward: int("coinReward").default(2).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Problem = typeof problems.$inferSelect;
export type InsertProblem = typeof problems.$inferInsert;

/**
 * Student progress - 生徒の学習進捗
 */
export const studentProgress = mysqlTable("studentProgress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  taskId: int("taskId").references(() => tasks.id),
  problemId: int("problemId").references(() => problems.id),
  isCorrect: boolean("isCorrect").notNull(),
  timeSpent: int("timeSpent").default(0).notNull(), // 秒単位
  xpEarned: int("xpEarned").default(0).notNull(),
  coinsEarned: int("coinsEarned").default(0).notNull(),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});

export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = typeof studentProgress.$inferInsert;

/**
 * Achievements - 実績・バッジ
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  iconUrl: varchar("iconUrl", { length: 255 }),
  condition: text("condition").notNull(), // 達成条件(JSON)
  xpReward: int("xpReward").default(0).notNull(),
  coinReward: int("coinReward").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * Student achievements - 生徒が獲得した実績
 */
export const studentAchievements = mysqlTable("studentAchievements", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  achievementId: int("achievementId").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type StudentAchievement = typeof studentAchievements.$inferSelect;
export type InsertStudentAchievement = typeof studentAchievements.$inferInsert;

/**
 * Story chapters - ストーリーチャプター
 */
export const storyChapters = mysqlTable("storyChapters", {
  id: int("id").autoincrement().primaryKey(),
  chapterNumber: int("chapterNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 255 }),
  requiredLevel: int("requiredLevel").default(1).notNull(),
  xpReward: int("xpReward").default(50).notNull(),
  coinReward: int("coinReward").default(20).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoryChapter = typeof storyChapters.$inferSelect;
export type InsertStoryChapter = typeof storyChapters.$inferInsert;

/**
 * Treasures - 宝物
 */
export const treasures = mysqlTable("treasures", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 255 }),
  chapterId: int("chapterId").references(() => storyChapters.id),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Treasure = typeof treasures.$inferSelect;
export type InsertTreasure = typeof treasures.$inferInsert;

/**
 * Student story progress - 生徒のストーリー進捗
 */
export const studentStoryProgress = mysqlTable("studentStoryProgress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  chapterId: int("chapterId").notNull().references(() => storyChapters.id),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: datetime("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudentStoryProgress = typeof studentStoryProgress.$inferSelect;
export type InsertStudentStoryProgress = typeof studentStoryProgress.$inferInsert;

/**
 * Student treasures - 生徒が獲得した宝物
 */
export const studentTreasures = mysqlTable("studentTreasures", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  treasureId: int("treasureId").notNull().references(() => treasures.id),
  acquiredAt: timestamp("acquiredAt").defaultNow().notNull(),
});

export type StudentTreasure = typeof studentTreasures.$inferSelect;
export type InsertStudentTreasure = typeof studentTreasures.$inferInsert;

/**
 * Learning Quizzes - 学習クイズ(ストーリー内)
 */
export const learningQuizzes = mysqlTable("learningQuizzes", {
  id: int("id").autoincrement().primaryKey(),
  chapterId: int("chapterId").notNull().references(() => storyChapters.id),
  questionText: text("questionText").notNull(), // 問題文
  questionType: mysqlEnum("questionType", ["multiple_choice", "number_input", "image_select", "true_false"]).notNull(),
  correctAnswer: varchar("correctAnswer", { length: 255 }).notNull(), // 正解
  options: text("options"), // JSON形式の選択肢
  explanation: text("explanation"), // 解説
  imageUrl: varchar("imageUrl", { length: 255 }), // 問題画像
  orderIndex: int("orderIndex").default(0).notNull(), // 表示順序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningQuiz = typeof learningQuizzes.$inferSelect;
export type InsertLearningQuiz = typeof learningQuizzes.$inferInsert;

/**
 * Student quiz progress - 生徒のクイズ進捗
 */
export const studentQuizProgress = mysqlTable("studentQuizProgress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  quizId: int("quizId").notNull().references(() => learningQuizzes.id),
  isCorrect: boolean("isCorrect").notNull(),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type StudentQuizProgress = typeof studentQuizProgress.$inferSelect;
export type InsertStudentQuizProgress = typeof studentQuizProgress.$inferInsert;

/**
 * OpenAI Usage Logs - OpenAI API使用ログ
 */
export const openaiUsageLogs = mysqlTable("openaiUsageLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id), // ユーザーID(nullの場合はシステム)
  studentId: int("studentId").references(() => students.id), // 生徒ID(キャラクター会話の場合)
  endpoint: varchar("endpoint", { length: 100 }).notNull(), // 使用したエンドポイント(chat, image等)
  model: varchar("model", { length: 100 }).notNull(), // 使用したモデル(gpt-4o-mini等)
  promptTokens: int("promptTokens").default(0).notNull(), // プロンプトトークン数
  completionTokens: int("completionTokens").default(0).notNull(), // 完了トークン数
  totalTokens: int("totalTokens").default(0).notNull(), // 合計トークン数
  estimatedCost: varchar("estimatedCost", { length: 20 }).default("0.000000").notNull(), // 推定コスト(USD)
  purpose: varchar("purpose", { length: 255 }), // 使用目的(character_chat, analysis等)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OpenAIUsageLog = typeof openaiUsageLogs.$inferSelect;
export type InsertOpenAIUsageLog = typeof openaiUsageLogs.$inferInsert;

/**
 * Parent-Children Relationships - 保護者-子供関係
 */
export const parentChildren = mysqlTable("parentChildren", {
  id: int("id").autoincrement().primaryKey(),
  parentUserId: int("parentUserId").notNull().references(() => users.id), // 保護者のユーザーID
  studentId: int("studentId").notNull().references(() => students.id), // 生徒ID
  relationship: varchar("relationship", { length: 50 }).default("parent").notNull(), // 関係性(parent, guardian等)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParentChild = typeof parentChildren.$inferSelect;
export type InsertParentChild = typeof parentChildren.$inferInsert;

/**
 * Daily Missions - デイリーミッション
 */
export const dailyMissions = mysqlTable("dailyMissions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(), // ミッションタイトル(ひらがな)
  description: text("description").notNull(), // 説明(ひらがな)
  missionType: mysqlEnum("missionType", ["solve_problems", "login", "story_complete", "gacha_roll", "chat_character"]).notNull(),
  targetCount: int("targetCount").default(1).notNull(), // 目標回数
  xpReward: int("xpReward").default(10).notNull(), // XP報酬
  coinReward: int("coinReward").default(5).notNull(), // コイン報酬
  isActive: boolean("isActive").default(true).notNull(), // アクティブかどうか
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyMission = typeof dailyMissions.$inferSelect;
export type InsertDailyMission = typeof dailyMissions.$inferInsert;

/**
 * Student Daily Mission Progress - 生徒のデイリーミッション進捗
 */
export const studentDailyProgress = mysqlTable("studentDailyProgress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  missionId: int("missionId").notNull().references(() => dailyMissions.id),
  currentCount: int("currentCount").default(0).notNull(), // 現在の進捗
  isCompleted: boolean("isCompleted").default(false).notNull(), // 完了したかどうか
  completedAt: timestamp("completedAt"), // 完了日時
  date: datetime("date").notNull(), // 対象日(日次リセット用)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentDailyProgress = typeof studentDailyProgress.$inferSelect;
export type InsertStudentDailyProgress = typeof studentDailyProgress.$inferInsert;

/**
 * Teachers table - 講師プロフィール
 */
export const teachers = mysqlTable("teachers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  specialization: varchar("specialization", { length: 100 }), // 専門分野
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 320 }),
  bio: text("bio"), // 自己紹介
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = typeof teachers.$inferInsert;

/**
 * Parents table - 保護者プロフィール
 */
export const parents = mysqlTable("parents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 320 }),
  occupation: varchar("occupation", { length: 100 }), // 職業
  address: text("address"), // 住所
  emergencyContact: varchar("emergencyContact", { length: 100 }), // 緊急連絡先
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Parent = typeof parents.$inferSelect;
export type InsertParent = typeof parents.$inferInsert;

/**
 * Teacher-Student relationship table - 講師-生徒関係
 */
export const teacherStudents = mysqlTable("teacherStudents", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull().references(() => teachers.id),
  studentId: int("studentId").notNull().references(() => students.id),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  notes: text("notes"), // メモ
});

export type TeacherStudent = typeof teacherStudents.$inferSelect;
export type InsertTeacherStudent = typeof teacherStudents.$inferInsert;


/**
 * Badges - バッジマスターデータ
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // バッジ名
  description: text("description").notNull(), // バッジの説明
  icon: varchar("icon", { length: 255 }), // アイコン（絵文字またはURL）
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  condition: text("condition").notNull(), // 獲得条件（JSON）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Student Badges - 生徒が獲得したバッジ
 */
export const studentBadges = mysqlTable("studentBadges", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  badgeId: int("badgeId").notNull().references(() => badges.id),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type StudentBadge = typeof studentBadges.$inferSelect;
export type InsertStudentBadge = typeof studentBadges.$inferInsert;

/**
 * AI Conversations table - AI会話ログ
 */
export const aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  userMessage: text("userMessage").notNull(), // 生徒のメッセージ
  aiResponse: text("aiResponse").notNull(), // AIの返答
  tokensUsed: int("tokensUsed").default(0).notNull(), // 使用トークン数
  model: varchar("model", { length: 50 }).default("gpt-3.5-turbo").notNull(), // 使用モデル
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]), // 感情分析結果
  topics: text("topics"), // トピック（JSON配列）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

/**
 * Gacha Items - ガチャアイテムマスターデータ
 */
export const gachaItems = mysqlTable("gachaItems", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // アイテム名
  description: text("description").notNull(), // アイテムの説明
  itemType: mysqlEnum("itemType", ["hat", "accessory", "background", "character"]).default("hat").notNull(),
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).default("common").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(), // 画像URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GachaItem = typeof gachaItems.$inferSelect;
export type InsertGachaItem = typeof gachaItems.$inferInsert;

/**
 * Student Inventory - 生徒のアイテム所持情報
 */
export const studentInventory = mysqlTable("studentInventory", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id),
  gachaItemId: int("gachaItemId").notNull().references(() => gachaItems.id),
  obtainedAt: timestamp("obtainedAt").defaultNow().notNull(),
});

export type StudentInventory = typeof studentInventory.$inferSelect;
export type InsertStudentInventory = typeof studentInventory.$inferInsert;
