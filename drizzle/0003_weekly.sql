ALTER TABLE `events` ADD `repeats_weekly` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `repeat_until` integer;