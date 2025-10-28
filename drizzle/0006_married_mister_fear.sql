CREATE TABLE `dailyMissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`missionType` enum('solve_problems','login','story_complete','gacha_roll','chat_character') NOT NULL,
	`targetCount` int NOT NULL DEFAULT 1,
	`xpReward` int NOT NULL DEFAULT 10,
	`coinReward` int NOT NULL DEFAULT 5,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyMissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentDailyProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`missionId` int NOT NULL,
	`currentCount` int NOT NULL DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`date` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studentDailyProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `studentDailyProgress` ADD CONSTRAINT `studentDailyProgress_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentDailyProgress` ADD CONSTRAINT `studentDailyProgress_missionId_dailyMissions_id_fk` FOREIGN KEY (`missionId`) REFERENCES `dailyMissions`(`id`) ON DELETE no action ON UPDATE no action;