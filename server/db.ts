import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  students, 
  InsertStudent,
  characters,
  InsertCharacter,
  characterItems,
  studentItems,
  tasks,
  InsertTask,
  problems,
  InsertProblem,
  studentProgress,
  InsertStudentProgress,
  achievements,
  studentAchievements,
  storyChapters,
  learningQuizzes,
  treasures,
  studentStoryProgress,
  studentTreasures
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: 'student' | 'teacher' | 'parent' | 'admin') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// Student queries
export async function getStudentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentById(studentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(students).orderBy(desc(students.createdAt));
}

export async function createStudent(student: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(students).values(student);
  return result;
}

export async function updateStudentXP(studentId: number, xpToAdd: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(students)
    .set({ 
      xp: sql`${students.xp} + ${xpToAdd}`,
      updatedAt: new Date()
    })
    .where(eq(students.id, studentId));
}

export async function updateStudentCoins(studentId: number, coinsToAdd: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(students)
    .set({ 
      coins: sql`${students.coins} + ${coinsToAdd}`,
      updatedAt: new Date()
    })
    .where(eq(students.id, studentId));
}

export async function updateStudentLevel(studentId: number, level: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(students).set({ level }).where(eq(students.id, studentId));
}

export async function updateStudentLoginStreak(studentId: number, loginStreak: number, lastLoginDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(students).set({ loginStreak, lastLoginDate }).where(eq(students.id, studentId));
}

// Character queries
export async function getCharactersByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(characters).where(eq(characters.studentId, studentId));
}

export async function createCharacter(character: InsertCharacter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(characters).values(character);
}

// Item queries
export async function addStudentItem(studentId: number, itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(studentItems).values({
    studentId,
    itemId,
    isEquipped: false,
  });
}

// Task queries
export async function getTasksByStudentId(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks)
    .where(eq(tasks.studentId, studentId))
    .orderBy(desc(tasks.createdAt));
}

export async function getTasksByTeacherId(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks)
    .where(eq(tasks.teacherId, teacherId))
    .orderBy(desc(tasks.createdAt));
}

export async function createTask(task: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(tasks).values(task);
}

export async function updateTaskStatus(taskId: number, status: "pending" | "in_progress" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { 
    status,
    updatedAt: new Date()
  };
  
  if (status === "completed") {
    updateData.completedAt = new Date();
  }
  
  await db.update(tasks)
    .set(updateData)
    .where(eq(tasks.id, taskId));
}

// Problem queries
export async function getRandomProblems(difficulty: "easy" | "medium" | "hard", limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(problems)
    .where(eq(problems.difficulty, difficulty))
    .orderBy(sql`RAND()`)
    .limit(limit);
}

export async function getProblemById(problemId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(problems).where(eq(problems.id, problemId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProblem(problem: InsertProblem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(problems).values(problem);
}

// Progress queries
export async function createStudentProgress(progress: InsertStudentProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(studentProgress).values(progress);
}

export async function getStudentProgressByStudentId(studentId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(studentProgress)
    .where(eq(studentProgress.studentId, studentId))
    .orderBy(desc(studentProgress.attemptedAt))
    .limit(limit);
}

export async function getStudentStats(studentId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const progressData = await db.select().from(studentProgress)
    .where(eq(studentProgress.studentId, studentId));
  
  const totalAttempts = progressData.length;
  const correctAttempts = progressData.filter(p => p.isCorrect).length;
  const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
  const totalXpEarned = progressData.reduce((sum, p) => sum + (p.xpEarned || 0), 0);
  
  return {
    totalAttempts,
    correctAttempts,
    accuracy: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0,
    totalTimeSpent,
    totalXpEarned
  };
}

// Story queries
export async function getAllStoryChapters() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(storyChapters).orderBy(storyChapters.chapterNumber);
}

export async function getStoryChapterById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const chapters = await db.select().from(storyChapters).where(eq(storyChapters.id, id)).limit(1);
  if (chapters.length === 0) return null;

  const chapter = chapters[0];
  
  // Get treasures for this chapter
  const chapterTreasures = await db.select().from(treasures).where(eq(treasures.chapterId, id));

  return {
    ...chapter,
    storyText: chapter.description || 'この章のストーリーはまだ書かれていません。',
    isCompleted: false, // TODO: 実際の進捗データを取得
    treasures: chapterTreasures,
  };
}

export async function getStudentStoryProgress(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(studentStoryProgress)
    .where(eq(studentStoryProgress.studentId, studentId));
}

export async function completeStoryChapter(studentId: number, chapterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if progress record exists
  const existing = await db.select().from(studentStoryProgress)
    .where(
      and(
        eq(studentStoryProgress.studentId, studentId),
        eq(studentStoryProgress.chapterId, chapterId)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing record
    await db.update(studentStoryProgress)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(studentStoryProgress.id, existing[0].id));
  } else {
    // Insert new record
    await db.insert(studentStoryProgress).values({
      studentId,
      chapterId,
      isCompleted: true,
      completedAt: new Date(),
    });
  }
}

// Treasure queries
export async function getStudentTreasures(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: studentTreasures.id,
    treasureId: studentTreasures.treasureId,
    acquiredAt: studentTreasures.acquiredAt,
    name: treasures.name,
    description: treasures.description,
    imageUrl: treasures.imageUrl,
    rarity: treasures.rarity
  })
  .from(studentTreasures)
  .leftJoin(treasures, eq(studentTreasures.treasureId, treasures.id))
  .where(eq(studentTreasures.studentId, studentId));
}

// Achievement queries
export async function getAllAchievements() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(achievements);
}

export async function getStudentAchievements(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: studentAchievements.id,
    achievementId: studentAchievements.achievementId,
    unlockedAt: studentAchievements.unlockedAt,
    name: achievements.name,
    description: achievements.description,
    iconUrl: achievements.iconUrl
  })
  .from(studentAchievements)
  .leftJoin(achievements, eq(studentAchievements.achievementId, achievements.id))
  .where(eq(studentAchievements.studentId, studentId));
}

// Item queries
export async function getAllCharacterItems() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(characterItems);
}

export async function getStudentItems(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: studentItems.id,
    itemId: studentItems.itemId,
    characterId: studentItems.characterId,
    isEquipped: studentItems.isEquipped,
    acquiredAt: studentItems.acquiredAt,
    name: characterItems.name,
    itemType: characterItems.itemType,
    imageUrl: characterItems.imageUrl,
    rarity: characterItems.rarity
  })
  .from(studentItems)
  .leftJoin(characterItems, eq(studentItems.itemId, characterItems.id))
  .where(eq(studentItems.studentId, studentId));
}

// Learning quiz queries
export async function getLearningQuizzesByChapter(chapterId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(learningQuizzes).where(eq(learningQuizzes.chapterId, chapterId));
}
