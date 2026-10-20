ALTER TABLE `events` ADD `source_url` text;--> statement-breakpoint
ALTER TABLE `events` ADD `origin` text DEFAULT 'form' NOT NULL;