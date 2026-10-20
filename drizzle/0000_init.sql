CREATE TYPE "public"."question_difficulty" AS ENUM('basic', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" integer NOT NULL,
	"transcript" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempts_duration_seconds_non_negative" CHECK ("attempts"."duration_seconds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"score" smallint NOT NULL,
	"feedback" text NOT NULL,
	"strengths" text[] NOT NULL,
	"gaps" text[] NOT NULL,
	"tips" text[] NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evaluations_attempt_id_unique" UNIQUE("attempt_id"),
	CONSTRAINT "evaluations_score_range" CHECK ("evaluations"."score" between 0 and 10)
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"text" text NOT NULL,
	"topic" text NOT NULL,
	"difficulty" "question_difficulty" NOT NULL,
	CONSTRAINT "questions_text_unique" UNIQUE("text")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_user_id_created_at_idx" ON "attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "attempts_user_id_question_id_idx" ON "attempts" USING btree ("user_id","question_id");