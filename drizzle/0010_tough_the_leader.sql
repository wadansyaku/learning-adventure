CREATE TABLE `aiConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`userMessage` text NOT NULL,
	`aiResponse` text NOT NULL,
	`tokensUsed` int NOT NULL DEFAULT 0,
	`model` varchar(50) NOT NULL DEFAULT 'gpt-3.5-turbo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aiConversations` ADD CONSTRAINT `aiConversations_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;