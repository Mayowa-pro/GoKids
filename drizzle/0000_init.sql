CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`region` text NOT NULL,
	`area` text NOT NULL,
	`venue` text NOT NULL,
	`postcode` text,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`is_free` integer NOT NULL,
	`price_text` text,
	`min_age` integer DEFAULT 0 NOT NULL,
	`max_age` integer DEFAULT 16 NOT NULL,
	`organiser` text NOT NULL,
	`contact_email` text,
	`booking_url` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`featured_until` integer,
	`is_sample` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE INDEX `events_region_start_idx` ON `events` (`region`,`status`,`starts_at`);