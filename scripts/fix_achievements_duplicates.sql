-- Learning Adventure - achievements テーブル重複削除スクリプト
-- 作成日: 2025-10-30
-- 目的: achievementsテーブルの重複レコードを削除し、UNIQUE制約を追加

-- ステップ1: 重複データの確認
SELECT name, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
FROM achievements
GROUP BY name
HAVING count > 1
ORDER BY count DESC, name;

-- ステップ2: 各実績名で最も古いIDを特定
CREATE TEMPORARY TABLE achievements_to_keep AS
SELECT MIN(id) as keep_id, name
FROM achievements
GROUP BY name;

-- ステップ3: studentAchievementsテーブルの参照を確認
SELECT sa.id, sa.studentId, sa.achievementId, a.name
FROM studentAchievements sa
JOIN achievements a ON sa.achievementId = a.id
WHERE a.id NOT IN (SELECT keep_id FROM achievements_to_keep)
ORDER BY a.name, sa.id;

-- ステップ4: studentAchievementsテーブルの参照を更新
-- 注意: この操作は慎重に行う必要があります
-- 重複している実績を獲得している生徒がいる場合、最も古いIDに統合されます

UPDATE studentAchievements sa
JOIN achievements a ON sa.achievementId = a.id
JOIN achievements_to_keep atk ON a.name = atk.name
SET sa.achievementId = atk.keep_id
WHERE sa.achievementId != atk.keep_id;

-- ステップ5: 重複レコードを削除
DELETE FROM achievements
WHERE id NOT IN (SELECT keep_id FROM achievements_to_keep);

-- ステップ6: UNIQUE制約を追加
ALTER TABLE achievements
ADD UNIQUE KEY unique_name (name);

-- ステップ7: 削除後の確認
SELECT COUNT(*) as total_achievements FROM achievements;
SELECT name, COUNT(*) as count FROM achievements GROUP BY name HAVING count > 1;

-- ステップ8: 一時テーブルをクリーンアップ
DROP TEMPORARY TABLE IF EXISTS achievements_to_keep;
