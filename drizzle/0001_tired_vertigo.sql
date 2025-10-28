CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`iconUrl` varchar(255),
	`condition` text NOT NULL,
	`xpReward` int NOT NULL DEFAULT 0,
	`coinReward` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characterItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`itemType` enum('outfit','accessory','hat','background') NOT NULL,
	`imageUrl` varchar(255) NOT NULL,
	`rarity` enum('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`coinCost` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `characterItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`animalType` varchar(50) NOT NULL,
	`imageUrl` varchar(255) NOT NULL,
	`level` int NOT NULL DEFAULT 1,
	`affection` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `problems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`problemType` enum('addition','subtraction','comparison','pattern','shape') NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
	`question` text NOT NULL,
	`correctAnswer` varchar(255) NOT NULL,
	`options` text,
	`imageUrl` varchar(255),
	`xpReward` int NOT NULL DEFAULT 5,
	`coinReward` int NOT NULL DEFAULT 2,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `problems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storyChapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(255),
	`requiredLevel` int NOT NULL DEFAULT 1,
	`xpReward` int NOT NULL DEFAULT 50,
	`coinReward` int NOT NULL DEFAULT 20,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storyChapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`itemId` int NOT NULL,
	`characterId` int,
	`isEquipped` boolean NOT NULL DEFAULT false,
	`acquiredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`taskId` int,
	`problemId` int,
	`isCorrect` boolean NOT NULL,
	`timeSpent` int NOT NULL DEFAULT 0,
	`xpEarned` int NOT NULL DEFAULT 0,
	`coinsEarned` int NOT NULL DEFAULT 0,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentStoryProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`chapterId` int NOT NULL,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentStoryProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentTreasures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`treasureId` int NOT NULL,
	`acquiredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentTreasures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`avatarIcon` varchar(255),
	`level` int NOT NULL DEFAULT 1,
	`xp` int NOT NULL DEFAULT 0,
	`coins` int NOT NULL DEFAULT 0,
	`currentCharacterId` int,
	`loginStreak` int NOT NULL DEFAULT 0,
	`lastLoginDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`teacherId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`taskType` enum('school_homework','app_problem') NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`xpReward` int NOT NULL DEFAULT 10,
	`coinReward` int NOT NULL DEFAULT 5,
	`dueDate` datetime,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`completedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treasures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`imageUrl` varchar(255),
	`chapterId` int,
	`rarity` enum('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `treasures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('student','teacher','parent','admin') NOT NULL DEFAULT 'student';--> statement-breakpoint
ALTER TABLE `characters` ADD CONSTRAINT `characters_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentAchievements` ADD CONSTRAINT `studentAchievements_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentAchievements` ADD CONSTRAINT `studentAchievements_achievementId_achievements_id_fk` FOREIGN KEY (`achievementId`) REFERENCES `achievements`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentItems` ADD CONSTRAINT `studentItems_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentItems` ADD CONSTRAINT `studentItems_itemId_characterItems_id_fk` FOREIGN KEY (`itemId`) REFERENCES `characterItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentItems` ADD CONSTRAINT `studentItems_characterId_characters_id_fk` FOREIGN KEY (`characterId`) REFERENCES `characters`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentProgress` ADD CONSTRAINT `studentProgress_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentProgress` ADD CONSTRAINT `studentProgress_taskId_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentProgress` ADD CONSTRAINT `studentProgress_problemId_problems_id_fk` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentStoryProgress` ADD CONSTRAINT `studentStoryProgress_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentStoryProgress` ADD CONSTRAINT `studentStoryProgress_chapterId_storyChapters_id_fk` FOREIGN KEY (`chapterId`) REFERENCES `storyChapters`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentTreasures` ADD CONSTRAINT `studentTreasures_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentTreasures` ADD CONSTRAINT `studentTreasures_treasureId_treasures_id_fk` FOREIGN KEY (`treasureId`) REFERENCES `treasures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_teacherId_users_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `treasures` ADD CONSTRAINT `treasures_chapterId_storyChapters_id_fk` FOREIGN KEY (`chapterId`) REFERENCES `storyChapters`(`id`) ON DELETE no action ON UPDATE no action;