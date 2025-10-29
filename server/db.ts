import { eq, and, desc, sql, gte, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  students, 
  InsertStudent,
  characterTypes,
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
  studentTreasures,
  openaiUsageLogs,
  parentChildren,
  dailyMissions,
  studentDailyProgress,
  teachers,
  teacherStudents
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

// Character Type queries
export async function getAllCharacterTypes() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(characterTypes);
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

// OpenAI usage log queries
export async function logOpenAIUsage(data: {
  userId?: number;
  studentId?: number;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: string;
  purpose?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(openaiUsageLogs).values(data);
  return result;
}

export async function getOpenAIUsageSummary() {
  const db = await getDb();
  if (!db) return null;
  
  // 今月の使用状況を集計
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const logs = await db.select().from(openaiUsageLogs)
    .where(sql`${openaiUsageLogs.createdAt} >= ${firstDayOfMonth}`);
  
  const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
  const totalCost = logs.reduce((sum, log) => sum + parseFloat(log.estimatedCost), 0);
  const totalCalls = logs.length;
  
  // 目的別の集計
  const byPurpose = logs.reduce((acc, log) => {
    const purpose = log.purpose || 'unknown';
    if (!acc[purpose]) {
      acc[purpose] = { calls: 0, tokens: 0, cost: 0 };
    }
    acc[purpose].calls++;
    acc[purpose].tokens += log.totalTokens;
    acc[purpose].cost += parseFloat(log.estimatedCost);
    return acc;
  }, {} as Record<string, { calls: number; tokens: number; cost: number }>);
  
  return {
    totalTokens,
    totalCost: totalCost.toFixed(6),
    totalCalls,
    byPurpose,
    period: {
      start: firstDayOfMonth.toISOString(),
      end: now.toISOString()
    }
  };
}

export async function getOpenAIUsageLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(openaiUsageLogs)
    .orderBy(desc(openaiUsageLogs.createdAt))
    .limit(limit);
}

// Parent-Children relationship queries
export async function addParentChildRelationship(parentUserId: number, studentId: number, relationship: string = "parent") {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(parentChildren).values({
    parentUserId,
    studentId,
    relationship
  });
  return result;
}

export async function getChildrenByParentUserId(parentUserId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: parentChildren.id,
    studentId: parentChildren.studentId,
    relationship: parentChildren.relationship,
    createdAt: parentChildren.createdAt,
    displayName: students.displayName,
    avatarIcon: students.avatarIcon,
    level: students.level,
    xp: students.xp,
    coins: students.coins,
    loginStreak: students.loginStreak,
    lastLoginDate: students.lastLoginDate
  })
  .from(parentChildren)
  .leftJoin(students, eq(parentChildren.studentId, students.id))
  .where(eq(parentChildren.parentUserId, parentUserId));
}

export async function removeParentChildRelationship(parentUserId: number, studentId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.delete(parentChildren)
    .where(and(
      eq(parentChildren.parentUserId, parentUserId),
      eq(parentChildren.studentId, studentId)
    ));
  return result;
}

// Daily mission queries
export async function getAllDailyMissions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dailyMissions).where(eq(dailyMissions.isActive, true));
}

export async function getStudentDailyProgress(studentId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const dateStr = date.toISOString().split('T')[0];
  
  return await db.select({
    id: studentDailyProgress.id,
    missionId: studentDailyProgress.missionId,
    currentCount: studentDailyProgress.currentCount,
    isCompleted: studentDailyProgress.isCompleted,
    completedAt: studentDailyProgress.completedAt,
    title: dailyMissions.title,
    description: dailyMissions.description,
    missionType: dailyMissions.missionType,
    targetCount: dailyMissions.targetCount,
    xpReward: dailyMissions.xpReward,
    coinReward: dailyMissions.coinReward
  })
  .from(studentDailyProgress)
  .leftJoin(dailyMissions, eq(studentDailyProgress.missionId, dailyMissions.id))
  .where(and(
    eq(studentDailyProgress.studentId, studentId),
    sql`DATE(${studentDailyProgress.date}) = ${dateStr}`
  ));
}

export async function updateDailyMissionProgress(studentId: number, missionType: string, incrementBy: number = 1) {
  const db = await getDb();
  if (!db) return null;
  
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Get active missions of this type
  const missions = await db.select().from(dailyMissions)
    .where(and(
      eq(dailyMissions.missionType, missionType as any),
      eq(dailyMissions.isActive, true)
    ));
  
  for (const mission of missions) {
    // Check if progress exists for today
    const existingProgress = await db.select().from(studentDailyProgress)
      .where(and(
        eq(studentDailyProgress.studentId, studentId),
        eq(studentDailyProgress.missionId, mission.id),
        sql`DATE(${studentDailyProgress.date}) = ${dateStr}`
      ))
      .limit(1);
    
    if (existingProgress.length > 0) {
      const progress = existingProgress[0];
      const newCount = progress.currentCount + incrementBy;
      const isCompleted = newCount >= mission.targetCount;
      
      await db.update(studentDailyProgress)
        .set({
          currentCount: newCount,
          isCompleted,
          completedAt: isCompleted && !progress.isCompleted ? new Date() : progress.completedAt
        })
        .where(eq(studentDailyProgress.id, progress.id));
      
      // Award rewards if just completed
      if (isCompleted && !progress.isCompleted) {
        await updateStudentXP(studentId, mission.xpReward);
        await updateStudentCoins(studentId, mission.coinReward);
      }
    } else {
      // Create new progress
      const isCompleted = incrementBy >= mission.targetCount;
      
      await db.insert(studentDailyProgress).values({
        studentId,
        missionId: mission.id,
        currentCount: incrementBy,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        date: today
      });
      
      // Award rewards if completed
      if (isCompleted) {
        await updateStudentXP(studentId, mission.xpReward);
        await updateStudentCoins(studentId, mission.coinReward);
      }
    }
  }
  
  return true;
}


// 保護者用統計API
export async function getChildWeeklyData(childId: number) {
  // 過去7日間の学習データを取得
  const weeklyData = [];
  
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - i);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dateStr = targetDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
    
    // その日の学習進捗を取得
    const db = await getDb();
    if (!db) {
      weeklyData.push({
        date: dateStr,
        problems: 0,
        correct: 0
      });
      continue;
    }
    
    const progress = await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.studentId, childId),
          gte(studentProgress.attemptedAt, targetDate),
          lt(studentProgress.attemptedAt, nextDate)
        )
      );
    
    const problemsCount = progress.length;
    const correctCount = progress.filter((p: any) => p.isCorrect).length;
    
    weeklyData.push({
      date: dateStr,
      problems: problemsCount,
      correct: correctCount
    });
  }
  
  return weeklyData;
}

export async function getChildSkillData(childId: number) {
  // 問題タイプ別の正答率を計算
  const db = await getDb();
  if (!db) return [];
  
  const progress = await db
    .select()
    .from(studentProgress)
    .leftJoin(problems, eq(studentProgress.problemId, problems.id))
    .where(eq(studentProgress.studentId, childId));
  
  const skillMap: Record<string, { total: number; correct: number }> = {};
  
  progress.forEach((row: any) => {
    const problemType = row.problems?.problemType || 'unknown';
    if (!skillMap[problemType]) {
      skillMap[problemType] = { total: 0, correct: 0 };
    }
    skillMap[problemType].total++;
    if (row.studentProgress.isCorrect) {
      skillMap[problemType].correct++;
    }
  });
  
  const skillNames: Record<string, string> = {
    addition: 'たしざん',
    subtraction: 'ひきざん',
    comparison: 'くらべ',
    pattern: 'かたち',
    shape: 'かたち'
  };
  
  return Object.entries(skillMap).map(([type, data]) => ({
    skill: skillNames[type] || type,
    progress: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
  }));
}

export async function getChildRecentActivities(childId: number, limit: number = 10) {
  // 最近の活動を取得
  const db = await getDb();
  if (!db) return [];
  
  const progress = await db
    .select()
    .from(studentProgress)
    .leftJoin(problems, eq(studentProgress.problemId, problems.id))
    .leftJoin(tasks, eq(studentProgress.taskId, tasks.id))
    .where(eq(studentProgress.studentId, childId))
    .orderBy(desc(studentProgress.attemptedAt))
    .limit(limit);
  
  return progress.map((row: any, index: number) => {
    const isCorrect = row.studentProgress.isCorrect;
    const problemType = row.problems?.problemType || '問題';
    const taskTitle = row.tasks?.title;
    
    return {
      id: index + 1,
      type: taskTitle ? '宿題' : '問題回答',
      description: isCorrect 
        ? `${taskTitle || problemType}を正解しました!` 
        : `${taskTitle || problemType}にチャレンジしました`,
      timestamp: row.studentProgress.attemptedAt.toISOString(),
      icon: isCorrect ? '✅' : '💪'
    };
  });
}


// 講師用API
export async function getTeacherByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(teachers)
    .where(eq(teachers.userId, userId))
    .limit(1);
  
  return result[0] || null;
}

export async function getTeacherStudents(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: teacherStudents.id,
      studentId: students.id,
      userId: students.userId,
      displayName: students.displayName,
      level: students.level,
      xp: students.xp,
      coins: students.coins,
      assignedAt: teacherStudents.assignedAt,
      notes: teacherStudents.notes,
    })
    .from(teacherStudents)
    .leftJoin(students, eq(teacherStudents.studentId, students.id))
    .where(eq(teacherStudents.teacherId, teacherId));
  
  return result;
}

export async function addTeacherStudent(teacherId: number, studentId: number, notes?: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .insert(teacherStudents)
    .values({
      teacherId,
      studentId,
      notes: notes || null,
    });
  
  return result;
}

export async function removeTeacherStudent(teacherId: number, studentId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .delete(teacherStudents)
    .where(
      and(
        eq(teacherStudents.teacherId, teacherId),
        eq(teacherStudents.studentId, studentId)
      )
    );
  
  return result;
}

export async function updateTeacherStudentNotes(teacherId: number, studentId: number, notes: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .update(teacherStudents)
    .set({ notes })
    .where(
      and(
        eq(teacherStudents.teacherId, teacherId),
        eq(teacherStudents.studentId, studentId)
      )
    );
  
  return result;
}

// ========================================
// 親子関係管理API
// ========================================

/**
 * 全ての親子関係を取得
 */
export async function getAllParentChildren() {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db
    .select({
      id: parentChildren.id,
      parentUserId: parentChildren.parentUserId,
      parentName: users.name,
      studentId: parentChildren.studentId,
      studentName: sql<string>`student_users.name`,
      relationship: parentChildren.relationship,
      createdAt: parentChildren.createdAt,
    })
    .from(parentChildren)
    .innerJoin(users, eq(parentChildren.parentUserId, users.id))
    .innerJoin(students, eq(parentChildren.studentId, students.id))
    .innerJoin(sql`users as student_users`, sql`students.userId = student_users.id`);

  return result;
}

/**
 * 親子関係を追加
 */
export async function addParentChild(parentUserId: number, studentId: number, relationship: string = 'parent') {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db.insert(parentChildren).values({
    parentUserId,
    studentId,
    relationship,
  });

  return result;
}

/**
 * 親子関係を削除
 */
export async function removeParentChild(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db.delete(parentChildren).where(eq(parentChildren.id, id));
  return result;
}

/**
 * 全ての保護者ユーザーを取得
 */
export async function getAllParents() {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, 'parent'));

  return result;
}

/**
 * 全ての生徒を詳細情報付きで取得
 */
export async function getAllStudentsWithDetails() {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db
    .select({
      id: students.id,
      userId: students.userId,
      displayName: students.displayName,
      userName: users.name,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id));

  return result;
}


/**
 * Update student gems
 */
export async function updateStudentGems(studentId: number, gemsToAdd: number) {
  const database = await getDb();
  if (!database) throw new Error('Database not initialized');
  
  const student = await database.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (student.length === 0) throw new Error('Student not found');
  
  const newGems = (student[0].gems || 0) + gemsToAdd;
  
  await database.update(students)
    .set({ gems: newGems, updatedAt: new Date() })
    .where(eq(students.id, studentId));
}


/**
 * Get OpenAI usage for a student within a time period
 */
export async function getStudentOpenAIUsage(studentId: number, periodHours: number) {
  const database = await getDb();
  if (!database) throw new Error('Database not initialized');
  
  const startTime = new Date(Date.now() - periodHours * 60 * 60 * 1000);
  
  const logs = await database
    .select()
    .from(openaiUsageLogs)
    .where(
      and(
        eq(openaiUsageLogs.studentId, studentId),
        gte(openaiUsageLogs.createdAt, startTime)
      )
    );
  
  // Calculate total cost in the period
  const totalCost = logs.reduce((sum, log) => {
    return sum + parseFloat(log.estimatedCost || '0');
  }, 0);
  
  return {
    totalCost,
    requestCount: logs.length,
    logs,
  };
}

/**
 * Check if student has exceeded usage limits
 * Returns usage percentage and limit info
 */
export async function checkStudentUsageLimits(studentId: number) {
  const database = await getDb();
  if (!database) throw new Error('Database not initialized');
  
  // Define limits (in JPY, 1 USD = 150 JPY)
  const limits = {
    threeHours: 10,    // 10円
    oneDay: 50,        // 50円
    oneWeek: 300,      // 300円
    oneMonth: 1000,    // 1000円
  };
  
  // Get usage for each period
  const threeHoursUsage = await getStudentOpenAIUsage(studentId, 3);
  const oneDayUsage = await getStudentOpenAIUsage(studentId, 24);
  const oneWeekUsage = await getStudentOpenAIUsage(studentId, 24 * 7);
  const oneMonthUsage = await getStudentOpenAIUsage(studentId, 24 * 30);
  
  // Convert USD to JPY (1 USD = 150 JPY)
  const toJPY = (usd: number) => usd * 150;
  
  const threeHoursCostJPY = toJPY(threeHoursUsage.totalCost);
  const oneDayCostJPY = toJPY(oneDayUsage.totalCost);
  const oneWeekCostJPY = toJPY(oneWeekUsage.totalCost);
  const oneMonthCostJPY = toJPY(oneMonthUsage.totalCost);
  
  // Calculate usage percentages
  const threeHoursPercent = (threeHoursCostJPY / limits.threeHours) * 100;
  const oneDayPercent = (oneDayCostJPY / limits.oneDay) * 100;
  const oneWeekPercent = (oneWeekCostJPY / limits.oneWeek) * 100;
  const oneMonthPercent = (oneMonthCostJPY / limits.oneMonth) * 100;
  
  // Find the highest usage percentage
  const maxPercent = Math.max(threeHoursPercent, oneDayPercent, oneWeekPercent, oneMonthPercent);
  
  // Determine restriction level
  let restrictionLevel: 'none' | 'warning' | 'delay' | 'blocked' = 'none';
  if (maxPercent >= 100) {
    restrictionLevel = 'blocked';
  } else if (maxPercent >= 80) {
    restrictionLevel = 'delay';
  } else if (maxPercent >= 60) {
    restrictionLevel = 'warning';
  }
  
  return {
    restrictionLevel,
    usage: {
      threeHours: { cost: threeHoursCostJPY, limit: limits.threeHours, percent: threeHoursPercent },
      oneDay: { cost: oneDayCostJPY, limit: limits.oneDay, percent: oneDayPercent },
      oneWeek: { cost: oneWeekCostJPY, limit: limits.oneWeek, percent: oneWeekPercent },
      oneMonth: { cost: oneMonthCostJPY, limit: limits.oneMonth, percent: oneMonthPercent },
    },
    maxPercent,
  };
}
