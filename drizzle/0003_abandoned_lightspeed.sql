CREATE TABLE `characterTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`species` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` varchar(255) NOT NULL,
	`personality` varchar(100),
	`unlockLevel` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `characterTypes_id` PRIMARY KEY(`id`)
);
