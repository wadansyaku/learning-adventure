ALTER TABLE `students` ADD `gems` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `rarity` enum('common','rare','epic','legendary') DEFAULT 'common' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `gemReward` int DEFAULT 1 NOT NULL;