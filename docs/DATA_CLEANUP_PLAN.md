# データ整備計画

**作成日:** 2025-10-29  
**バージョン:** 96310742  
**推定総工数:** 16-24時間

---

## 目次

1. [即座に実施すべきタスク](#1-即座に実施すべきタスク)
2. [短期タスク（1週間以内）](#2-短期タスク1週間以内)
3. [中期タスク（1ヶ月以内）](#3-中期タスク1ヶ月以内)
4. [長期タスク（3ヶ月以内）](#4-長期タスク3ヶ月以内)
5. [データ品質チェックリスト](#5-データ品質チェックリスト)

---

## 1. 即座に実施すべきタスク

### 1.1 storyChapters重複削除

**問題:** 同じタイトルのstoryChaptersが複数存在

**影響:** データの一貫性が損なわれ、ストーリー表示が不正確

**実施手順:**

```sql
-- ステップ1: 現状確認
SELECT title, COUNT(*) as count, GROUP_CONCAT(id) as ids
FROM storyChapters
GROUP BY title
HAVING count > 1
ORDER BY title;

-- ステップ2: 保持するレコードを決定（最小IDを保持）
SELECT MIN(id) as keep_id, title
FROM storyChapters
GROUP BY title;

-- ステップ3: learningQuizzesの参照を更新
-- 各重複タイトルグループについて、最小IDに統一
UPDATE learningQuizzes lq
SET lq.chapterId = (
  SELECT MIN(sc.id)
  FROM storyChapters sc
  WHERE sc.title = (
    SELECT title FROM storyChapters WHERE id = lq.chapterId
  )
)
WHERE lq.chapterId IN (
  SELECT id FROM (
    SELECT sc2.id
    FROM storyChapters sc2
    WHERE sc2.title IN (
      SELECT title FROM storyChapters GROUP BY title HAVING COUNT(*) > 1
    )
    AND sc2.id NOT IN (
      SELECT MIN(id) FROM storyChapters GROUP BY title
    )
  ) AS duplicates
);

-- ステップ4: studentStoryProgressの参照を更新
UPDATE studentStoryProgress ssp
SET ssp.chapterId = (
  SELECT MIN(sc.id)
  FROM storyChapters sc
  WHERE sc.title = (
    SELECT title FROM storyChapters WHERE id = ssp.chapterId
  )
)
WHERE ssp.chapterId IN (
  SELECT id FROM (
    SELECT sc2.id
    FROM storyChapters sc2
    WHERE sc2.title IN (
      SELECT title FROM storyChapters GROUP BY title HAVING COUNT(*) > 1
    )
    AND sc2.id NOT IN (
      SELECT MIN(id) FROM storyChapters GROUP BY title
    )
  ) AS duplicates
);

-- ステップ5: treasuresの参照を更新
UPDATE treasures t
SET t.chapterId = (
  SELECT MIN(sc.id)
  FROM storyChapters sc
  WHERE sc.title = (
    SELECT title FROM storyChapters WHERE id = t.chapterId
  )
)
WHERE t.chapterId IN (
  SELECT id FROM (
    SELECT sc2.id
    FROM storyChapters sc2
    WHERE sc2.title IN (
      SELECT title FROM storyChapters GROUP BY title HAVING COUNT(*) > 1
    )
    AND sc2.id NOT IN (
      SELECT MIN(id) FROM storyChapters GROUP BY title
    )
  ) AS duplicates
);

-- ステップ6: 重複レコードを削除
DELETE FROM storyChapters
WHERE id NOT IN (
  SELECT keep_id FROM (
    SELECT MIN(id) as keep_id
    FROM storyChapters
    GROUP BY title
  ) AS keepers
);

-- ステップ7: 結果確認
SELECT title, COUNT(*) as count
FROM storyChapters
GROUP BY title
HAVING count > 1;
-- 結果が0件であることを確認
```

**推定工数:** 2時間  
**リスク:** 中  
**バックアップ:** 必須

---

### 1.2 characterTypes完全性確認

**目標:** 10種類の動物キャラクターが全て正しく登録されていることを確認

**実施手順:**

```sql
-- ステップ1: 現状確認
SELECT id, species, name, unlockLevel, imageUrl
FROM characterTypes
ORDER BY unlockLevel, id;

-- ステップ2: 期待されるキャラクターリスト
-- panda, rabbit, penguin, fox, owl, dog, squirrel, elephant, cat, bear

-- ステップ3: 欠損確認
SELECT 'panda' as species WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'panda')
UNION ALL
SELECT 'rabbit' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'rabbit')
UNION ALL
SELECT 'penguin' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'penguin')
UNION ALL
SELECT 'fox' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'fox')
UNION ALL
SELECT 'owl' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'owl')
UNION ALL
SELECT 'dog' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'dog')
UNION ALL
SELECT 'squirrel' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'squirrel')
UNION ALL
SELECT 'elephant' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'elephant')
UNION ALL
SELECT 'cat' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'cat')
UNION ALL
SELECT 'bear' WHERE NOT EXISTS (SELECT 1 FROM characterTypes WHERE species = 'bear');

-- ステップ4: 画像URLの確認
SELECT species, imageUrl
FROM characterTypes
WHERE imageUrl IS NULL OR imageUrl = '';

-- ステップ5: 重複確認
SELECT species, COUNT(*) as count
FROM characterTypes
GROUP BY species
HAVING count > 1;
```

**推定工数:** 1時間  
**リスク:** 低

---

### 1.3 dailyMissions完全性確認

**目標:** 5種類のデイリーミッションが全て登録されていることを確認

**実施手順:**

```sql
-- ステップ1: 現状確認
SELECT id, missionType, title, targetCount, xpReward, coinReward, isActive
FROM dailyMissions
ORDER BY missionType;

-- ステップ2: 期待されるミッションタイプ
-- solve_problems, complete_story, gacha, login, complete_tasks

-- ステップ3: 欠損確認
SELECT 'solve_problems' as missionType WHERE NOT EXISTS (SELECT 1 FROM dailyMissions WHERE missionType = 'solve_problems' AND isActive = true)
UNION ALL
SELECT 'complete_story' WHERE NOT EXISTS (SELECT 1 FROM dailyMissions WHERE missionType = 'complete_story' AND isActive = true)
UNION ALL
SELECT 'gacha' WHERE NOT EXISTS (SELECT 1 FROM dailyMissions WHERE missionType = 'gacha' AND isActive = true)
UNION ALL
SELECT 'login' WHERE NOT EXISTS (SELECT 1 FROM dailyMissions WHERE missionType = 'login' AND isActive = true)
UNION ALL
SELECT 'complete_tasks' WHERE NOT EXISTS (SELECT 1 FROM dailyMissions WHERE missionType = 'complete_tasks' AND isActive = true);

-- ステップ4: 欠損があれば追加
INSERT INTO dailyMissions (missionType, title, description, targetCount, xpReward, coinReward, isActive)
SELECT * FROM (
  SELECT 'solve_problems', 'もんだいを3こといてみよう!', 'もんだいを3こせいかいしてね', 3, 15, 10, true
  UNION ALL
  SELECT 'solve_problems', 'もんだいを5こといてみよう!', 'もんだいを5こせいかいしてね', 5, 30, 20, true
  UNION ALL
  SELECT 'complete_story', 'ぼうけんにでかけよう!', 'ストーリーを1つクリアしてね', 1, 50, 25, true
  UNION ALL
  SELECT 'login', 'まいにちログイン!', 'まいにちあそびにきてね', 1, 10, 5, true
  UNION ALL
  SELECT 'gacha', 'ガチャをひいてみよう!', 'ガチャを1かいひいてね', 1, 20, 10, true
) AS new_missions
WHERE NOT EXISTS (
  SELECT 1 FROM dailyMissions dm
  WHERE dm.missionType = new_missions.col1
  AND dm.targetCount = new_missions.col4
  AND dm.isActive = true
);
```

**推定工数:** 1時間  
**リスク:** 低

---

## 2. 短期タスク（1週間以内）

### 2.1 teachers/parentsテーブル作成

**目標:** ロールごとのプロフィールテーブルを作成

**実施手順:**

```sql
-- teachersテーブル作成
CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  displayName VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) COMMENT '専門分野',
  phoneNumber VARCHAR(20),
  email VARCHAR(320),
  bio TEXT COMMENT '自己紹介',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- parentsテーブル作成
CREATE TABLE parents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  displayName VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(20),
  email VARCHAR(320),
  occupation VARCHAR(100) COMMENT '職業',
  address TEXT COMMENT '住所',
  emergencyContact VARCHAR(100) COMMENT '緊急連絡先',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- teacherStudentsテーブル作成
CREATE TABLE teacherStudents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacherId INT NOT NULL,
  studentId INT NOT NULL,
  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  notes TEXT COMMENT 'メモ',
  FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_teacher_student (teacherId, studentId),
  INDEX idx_teacherId (teacherId),
  INDEX idx_studentId (studentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**schema.ts更新:**

```typescript
// drizzle/schema.ts に追加

export const teachers = mysqlTable("teachers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  specialization: varchar("specialization", { length: 100 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 320 }),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = typeof teachers.$inferInsert;

export const parents = mysqlTable("parents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 320 }),
  occupation: varchar("occupation", { length: 100 }),
  address: text("address"),
  emergencyContact: varchar("emergencyContact", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Parent = typeof parents.$inferSelect;
export type InsertParent = typeof parents.$inferInsert;

export const teacherStudents = mysqlTable("teacherStudents", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull().references(() => teachers.id),
  studentId: int("studentId").notNull().references(() => students.id),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  notes: text("notes"),
});

export type TeacherStudent = typeof teacherStudents.$inferSelect;
export type InsertTeacherStudent = typeof teacherStudents.$inferInsert;
```

**推定工数:** 3時間  
**リスク:** 低

---

### 2.2 テストデータ拡充

**目標:** 複数の生徒、保護者、講師を作成し、リアルなテスト環境を構築

**実施手順:**

```sql
-- 生徒データ拡充（レベル別）
-- 既存: 480030 (レベル1)
-- 追加: 480031 (レベル3), 480032 (レベル5), 480033 (レベル10)

-- 生徒2: レベル3
INSERT INTO students (userId, displayName, level, xp, coins, loginStreak)
VALUES (480031, 'さくらちゃん', 3, 250, 150, 5);

-- 生徒3: レベル5
INSERT INTO students (userId, displayName, level, xp, coins, loginStreak)
VALUES (480032, 'たろうくん', 5, 500, 300, 10);

-- 生徒4: レベル10
INSERT INTO students (userId, displayName, level, xp, coins, loginStreak)
VALUES (480033, 'はなこちゃん', 10, 1000, 600, 20);

-- 各生徒にキャラクターを割り当て
INSERT INTO characters (studentId, name, animalType, imageUrl, level, affection)
SELECT s.id, ct.name, ct.species, ct.imageUrl, 1, 50
FROM students s
CROSS JOIN characterTypes ct
WHERE s.userId IN (480031, 480032, 480033)
AND ct.species IN ('rabbit', 'fox', 'owl')
LIMIT 3;

-- 親子関係追加
INSERT INTO parentChildren (parentId, childId)
VALUES 
  (540011, 480031), -- 保護者1 → 生徒2
  (540012, 480032), -- 保護者2 → 生徒3
  (540012, 480033); -- 保護者2 → 生徒4

-- 講師-生徒関係追加（teacherStudentsテーブル作成後）
INSERT INTO teacherStudents (teacherId, studentId)
SELECT t.id, s.id
FROM teachers t
CROSS JOIN students s
WHERE t.userId = 540022
AND s.userId IN (480030, 480031, 480032);

-- 学習進捗データ追加
INSERT INTO studentProgress (studentId, problemId, isCorrect, timeSpent, xpEarned, coinsEarned)
SELECT s.id, p.id, 
  CASE WHEN RAND() > 0.2 THEN 1 ELSE 0 END as isCorrect,
  FLOOR(10 + RAND() * 50) as timeSpent,
  CASE WHEN RAND() > 0.2 THEN p.xpReward ELSE 0 END as xpEarned,
  CASE WHEN RAND() > 0.2 THEN p.coinReward ELSE 0 END as coinsEarned
FROM students s
CROSS JOIN problems p
WHERE s.userId IN (480030, 480031, 480032, 480033)
AND p.id <= 50
ORDER BY RAND()
LIMIT 200;

-- デイリーミッション進捗データ追加
INSERT INTO studentDailyProgress (studentId, missionId, currentCount, isCompleted, date)
SELECT s.id, dm.id, 
  FLOOR(RAND() * (dm.targetCount + 2)) as currentCount,
  CASE WHEN RAND() > 0.5 THEN 1 ELSE 0 END as isCompleted,
  CURDATE() as date
FROM students s
CROSS JOIN dailyMissions dm
WHERE s.userId IN (480030, 480031, 480032, 480033)
AND dm.isActive = true;
```

**推定工数:** 4時間  
**リスク:** 低

---

### 2.3 データ整合性チェック

**目標:** 孤児レコード、NULL値、不正なデータを検出・修正

**実施手順:**

```sql
-- 孤児レコード検出

-- 1. charactersテーブル
SELECT c.id, c.studentId, c.name
FROM characters c
LEFT JOIN students s ON c.studentId = s.id
WHERE s.id IS NULL;

-- 2. studentItemsテーブル
SELECT si.id, si.studentId, si.itemId
FROM studentItems si
LEFT JOIN students s ON si.studentId = s.id
LEFT JOIN characterItems ci ON si.itemId = ci.id
WHERE s.id IS NULL OR ci.id IS NULL;

-- 3. studentProgressテーブル
SELECT sp.id, sp.studentId, sp.problemId, sp.taskId
FROM studentProgress sp
LEFT JOIN students s ON sp.studentId = s.id
LEFT JOIN problems p ON sp.problemId = p.id
LEFT JOIN tasks t ON sp.taskId = t.id
WHERE s.id IS NULL 
   OR (sp.problemId IS NOT NULL AND p.id IS NULL)
   OR (sp.taskId IS NOT NULL AND t.id IS NULL);

-- NULL値検証

-- 1. studentsテーブル
SELECT COUNT(*) as null_displayName_count
FROM students
WHERE displayName IS NULL OR displayName = '';

-- 2. problemsテーブル
SELECT COUNT(*) as null_question_count
FROM problems
WHERE question IS NULL OR question = '';

SELECT COUNT(*) as null_correctAnswer_count
FROM problems
WHERE correctAnswer IS NULL OR correctAnswer = '';

-- 3. characterTypesテーブル
SELECT COUNT(*) as null_imageUrl_count
FROM characterTypes
WHERE imageUrl IS NULL OR imageUrl = '';

-- 不正なデータ検証

-- 1. 負のXP/コイン
SELECT id, userId, displayName, xp, coins
FROM students
WHERE xp < 0 OR coins < 0;

-- 2. レベルとXPの不整合
SELECT id, userId, displayName, level, xp
FROM students
WHERE level != FLOOR(xp / 100) + 1;

-- 3. 未来の日付
SELECT id, studentId, attemptedAt
FROM studentProgress
WHERE attemptedAt > NOW();
```

**推定工数:** 3時間  
**リスク:** 低

---

## 3. 中期タスク（1ヶ月以内）

### 3.1 学習コンテンツ拡充

**problems拡充:**

```sql
-- 現在の問題数確認
SELECT problemType, difficulty, COUNT(*) as count
FROM problems
GROUP BY problemType, difficulty
ORDER BY problemType, difficulty;

-- 目標: 各タイプ・各難易度で100問以上

-- 不足している組み合わせを特定
SELECT pt.type, d.diff, COALESCE(p.count, 0) as current_count, 100 - COALESCE(p.count, 0) as needed
FROM (
  SELECT 'addition' as type UNION ALL
  SELECT 'subtraction' UNION ALL
  SELECT 'comparison' UNION ALL
  SELECT 'pattern' UNION ALL
  SELECT 'shape'
) pt
CROSS JOIN (
  SELECT 'easy' as diff UNION ALL
  SELECT 'medium' UNION ALL
  SELECT 'hard'
) d
LEFT JOIN (
  SELECT problemType, difficulty, COUNT(*) as count
  FROM problems
  GROUP BY problemType, difficulty
) p ON pt.type = p.problemType AND d.diff = p.difficulty
WHERE COALESCE(p.count, 0) < 100
ORDER BY needed DESC;
```

**推定工数:** 12時間（問題作成含む）  
**リスク:** 低

---

### 3.2 storyChapters拡充

**目標:** 10章 → 20章に拡充

```sql
-- 現在の章数確認
SELECT COUNT(DISTINCT chapterNumber) as chapter_count
FROM storyChapters;

-- 新しい章の追加（11-20章）
INSERT INTO storyChapters (chapterNumber, title, description, requiredLevel, xpReward, coinReward)
VALUES
  (11, 'だい11しょう: ふしぎなもり', 'ふしぎなもりでたからさがし!', 11, 60, 25),
  (12, 'だい12しょう: うみのぼうけん', 'うみのそこにはなにがある?', 12, 65, 30),
  -- ... 残り8章
  (20, 'だい20しょう: さいごのちょうせん', 'すべてのなかまとさいごのぼうけん!', 20, 100, 50);

-- 各章にlearningQuizzesを追加（3-5問）
INSERT INTO learningQuizzes (chapterId, questionText, questionType, correctAnswer, options, xpReward)
SELECT sc.id, 
  CONCAT('もんだい', FLOOR(1 + RAND() * 100), 'は?'),
  'number_input',
  FLOOR(1 + RAND() * 20),
  NULL,
  10
FROM storyChapters sc
WHERE sc.chapterNumber >= 11
LIMIT 50;
```

**推定工数:** 16時間（ストーリー作成含む）  
**リスク:** 低

---

### 3.3 achievements拡充

**目標:** 20実績 → 50実績

```sql
-- 現在の実績数確認
SELECT COUNT(*) as achievement_count FROM achievements;

-- 新しい実績の追加
INSERT INTO achievements (name, description, iconUrl, condition, xpReward, coinReward)
VALUES
  ('はじめのいっぽ', 'はじめてもんだいをといたよ!', '/icons/first_step.png', '{"type":"solve_problems","count":1}', 10, 5),
  ('もんだいマスター', 'もんだいを100こといたよ!', '/icons/problem_master.png', '{"type":"solve_problems","count":100}', 100, 50),
  ('ストーリーたんけんか', 'ストーリーを5こクリアしたよ!', '/icons/story_explorer.png', '{"type":"complete_story","count":5}', 50, 25),
  -- ... 残り47実績
  ('でんせつのぼうけんしゃ', 'すべてのストーリーをクリアしたよ!', '/icons/legend.png', '{"type":"complete_all_stories"}', 500, 250);
```

**推定工数:** 6時間  
**リスク:** 低

---

## 4. 長期タスク（3ヶ月以内）

### 4.1 データアーカイブ戦略

**目標:** 古いデータをアーカイブし、パフォーマンスを維持

```sql
-- アーカイブテーブル作成
CREATE TABLE studentProgress_archive (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  taskId INT,
  problemId INT,
  isCorrect BOOLEAN NOT NULL,
  timeSpent INT DEFAULT 0 NOT NULL,
  xpEarned INT DEFAULT 0 NOT NULL,
  coinsEarned INT DEFAULT 0 NOT NULL,
  attemptedAt TIMESTAMP NOT NULL,
  archivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_studentId_attemptedAt (studentId, attemptedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3ヶ月以上前のデータをアーカイブ
INSERT INTO studentProgress_archive 
SELECT *, NOW() as archivedAt
FROM studentProgress
WHERE attemptedAt < DATE_SUB(NOW(), INTERVAL 3 MONTH);

DELETE FROM studentProgress
WHERE attemptedAt < DATE_SUB(NOW(), INTERVAL 3 MONTH);

-- openaiUsageLogsアーカイブ
CREATE TABLE openaiUsageLogs_archive LIKE openaiUsageLogs;

INSERT INTO openaiUsageLogs_archive
SELECT *, NOW() as archivedAt
FROM openaiUsageLogs
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 1 MONTH);

DELETE FROM openaiUsageLogs
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 1 MONTH);
```

**推定工数:** 8時間  
**リスク:** 中（バックアップ必須）

---

### 4.2 集計テーブル構築

**目標:** 頻繁なクエリのパフォーマンス向上

```sql
-- 日次集計テーブル
CREATE TABLE student_daily_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  date DATE NOT NULL,
  problemsSolved INT DEFAULT 0,
  problemsCorrect INT DEFAULT 0,
  totalTimeSpent INT DEFAULT 0,
  xpEarned INT DEFAULT 0,
  coinsEarned INT DEFAULT 0,
  storiesCompleted INT DEFAULT 0,
  loginCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY unique_student_date (studentId, date),
  INDEX idx_studentId_date (studentId, date),
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 週次集計テーブル
CREATE TABLE student_weekly_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  weekStartDate DATE NOT NULL,
  problemsSolved INT DEFAULT 0,
  problemsCorrect INT DEFAULT 0,
  totalTimeSpent INT DEFAULT 0,
  xpEarned INT DEFAULT 0,
  coinsEarned INT DEFAULT 0,
  storiesCompleted INT DEFAULT 0,
  loginDays INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY unique_student_week (studentId, weekStartDate),
  INDEX idx_studentId_week (studentId, weekStartDate),
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 集計処理（日次バッチ）
INSERT INTO student_daily_stats (studentId, date, problemsSolved, problemsCorrect, totalTimeSpent, xpEarned, coinsEarned)
SELECT 
  studentId,
  DATE(attemptedAt) as date,
  COUNT(*) as problemsSolved,
  SUM(CASE WHEN isCorrect THEN 1 ELSE 0 END) as problemsCorrect,
  SUM(timeSpent) as totalTimeSpent,
  SUM(xpEarned) as xpEarned,
  SUM(coinsEarned) as coinsEarned
FROM studentProgress
WHERE DATE(attemptedAt) = CURDATE() - INTERVAL 1 DAY
GROUP BY studentId, DATE(attemptedAt)
ON DUPLICATE KEY UPDATE
  problemsSolved = VALUES(problemsSolved),
  problemsCorrect = VALUES(problemsCorrect),
  totalTimeSpent = VALUES(totalTimeSpent),
  xpEarned = VALUES(xpEarned),
  coinsEarned = VALUES(coinsEarned);
```

**推定工数:** 12時間  
**リスク:** 中

---

## 5. データ品質チェックリスト

### 5.1 日次チェック

- [ ] 新規ユーザー登録の確認
- [ ] 孤児レコードの検出
- [ ] NULL値の検証
- [ ] 負の値の検出
- [ ] 未来の日付の検出

### 5.2 週次チェック

- [ ] データベースバックアップの確認
- [ ] インデックスの最適化
- [ ] テーブルサイズの確認
- [ ] スロークエリログの確認
- [ ] 重複レコードの検出

### 5.3 月次チェック

- [ ] データアーカイブの実施
- [ ] 集計テーブルの更新
- [ ] パフォーマンステストの実施
- [ ] データ整合性の包括的チェック
- [ ] スキーマ変更の計画

---

## 6. 実施スケジュール

| フェーズ | タスク | 推定工数 | 優先度 | 期限 |
|---------|--------|---------|--------|------|
| Phase 1 | storyChapters重複削除 | 2時間 | 高 | 即座 |
| Phase 1 | characterTypes完全性確認 | 1時間 | 高 | 即座 |
| Phase 1 | dailyMissions完全性確認 | 1時間 | 高 | 即座 |
| Phase 2 | teachers/parentsテーブル作成 | 3時間 | 高 | 1週間 |
| Phase 2 | テストデータ拡充 | 4時間 | 中 | 1週間 |
| Phase 2 | データ整合性チェック | 3時間 | 中 | 1週間 |
| Phase 3 | problems拡充 | 12時間 | 中 | 1ヶ月 |
| Phase 3 | storyChapters拡充 | 16時間 | 中 | 1ヶ月 |
| Phase 3 | achievements拡充 | 6時間 | 低 | 1ヶ月 |
| Phase 4 | データアーカイブ戦略 | 8時間 | 低 | 3ヶ月 |
| Phase 4 | 集計テーブル構築 | 12時間 | 低 | 3ヶ月 |

**総推定工数:** 68時間

---

**作成者:** Manus AI Agent  
**承認者:** （未定）  
**次回レビュー:** Phase 1完了後
