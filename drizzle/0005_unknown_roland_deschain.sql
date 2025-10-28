CREATE TABLE `parentChildren` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentUserId` int NOT NULL,
	`studentId` int NOT NULL,
	`relationship` varchar(50) NOT NULL DEFAULT 'parent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parentChildren_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `parentChildren` ADD CONSTRAINT `parentChildren_parentUserId_users_id_fk` FOREIGN KEY (`parentUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parentChildren` ADD CONSTRAINT `parentChildren_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;