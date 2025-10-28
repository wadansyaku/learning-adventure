CREATE TABLE `openaiUsageLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`studentId` int,
	`endpoint` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`promptTokens` int NOT NULL DEFAULT 0,
	`completionTokens` int NOT NULL DEFAULT 0,
	`totalTokens` int NOT NULL DEFAULT 0,
	`estimatedCost` varchar(20) NOT NULL DEFAULT '0.000000',
	`purpose` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `openaiUsageLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `openaiUsageLogs` ADD CONSTRAINT `openaiUsageLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `openaiUsageLogs` ADD CONSTRAINT `openaiUsageLogs_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;