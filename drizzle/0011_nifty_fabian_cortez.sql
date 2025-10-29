CREATE TABLE `gachaItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`itemType` enum('hat','accessory','background','character') NOT NULL DEFAULT 'hat',
	`rarity` enum('common','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`imageUrl` varchar(500) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gachaItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentInventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`gachaItemId` int NOT NULL,
	`obtainedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studentInventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `studentInventory` ADD CONSTRAINT `studentInventory_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studentInventory` ADD CONSTRAINT `studentInventory_gachaItemId_gachaItems_id_fk` FOREIGN KEY (`gachaItemId`) REFERENCES `gachaItems`(`id`) ON DELETE no action ON UPDATE no action;