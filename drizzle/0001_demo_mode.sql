CREATE TABLE "demo_usage" (
	"day" date PRIMARY KEY NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "demo_usage_used_non_negative" CHECK ("demo_usage"."used" >= 0)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "demo_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_demo_used_non_negative" CHECK ("users"."demo_used" >= 0);