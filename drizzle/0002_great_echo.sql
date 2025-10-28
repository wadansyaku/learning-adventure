CREATE TABLE `learningQuizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chapterId` int NOT NULL,
	`questionText` text NOT NULL,
	`questionType` enum('multiple_choice','number_input','image_select','true_false') NOT NULL,
	`correctAnswer` varchar(255) NOT NULL,
	`options` text,
	`explanation` text,
	`imageUrl` varchar(255),
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learningQuizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentQuizProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`quizId` int NOT NULL,
	`isCorrect` boolean NOT NULL,
	`answeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentQuizProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `learningQuizzes` ADD CONSTRAINT `learningQuizzes_chapterId_storyChapters_id_fk` FOREIGN KEY (`chapterId`) REFERENCES `storyChapters`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentQuizProgress` ADD CONSTRAINT `studentQuizProgress_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentQuizProgress` ADD CONSTRAINT `studentQuizProgress_quizId_learningQuizzes_id_fk` FOREIGN KEY (`quizId`) REFERENCES `learningQuizzes`(`id`) ON DELETE no action ON UPDATE no action;