ALTER TABLE `aiConversations` ADD `sentiment` enum('positive','neutral','negative');--> statement-breakpoint
ALTER TABLE `aiConversations` ADD `topics` text;