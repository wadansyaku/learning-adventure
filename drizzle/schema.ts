import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime } from "drizzle-orm/mysql-core";

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
  currentCharacterId: int("currentCharacterId"), // 現在のキャラクターID
  loginStreak: int("loginStreak").default(0).notNull(), // 連続ログイン日数
  lastLoginDate: datetime("lastLoginDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Characters table - 2D animal characters
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
  xpReward: int("xpReward").default(10).notNull(),
  coinReward: int("coinReward").default(5).notNull(),
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
