ALTER TABLE `characterItems` MODIFY COLUMN `itemType` enum('outfit','accessory','hat','background','character') DEFAULT 'hat';--> statement-breakpoint
ALTER TABLE `characterItems` MODIFY COLUMN `imageUrl` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `characterItems` MODIFY COLUMN `rarity` enum('common','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'common';