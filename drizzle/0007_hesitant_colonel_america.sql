CREATE TABLE `parents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`phoneNumber` varchar(20),
	`email` varchar(320),
	`occupation` varchar(100),
	`address` text,
	`emergencyContact` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parents_id` PRIMARY KEY(`id`),
	CONSTRAINT `parents_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `teacherStudents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`studentId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	CONSTRAINT `teacherStudents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`specialization` varchar(100),
	`phoneNumber` varchar(20),
	`email` varchar(320),
	`bio` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teachers_id` PRIMARY KEY(`id`),
	CONSTRAINT `teachers_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `parents` ADD CONSTRAINT `parents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacherStudents` ADD CONSTRAINT `teacherStudents_teacherId_teachers_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacherStudents` ADD CONSTRAINT `teacherStudents_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;