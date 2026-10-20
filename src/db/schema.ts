import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { QUESTION_DIFFICULTIES } from "@/data/react-questions";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const questionDifficulty = pgEnum(
  "question_difficulty",
  QUESTION_DIFFICULTIES,
);

// Keyed by the Clerk user id; Clerk stays the source of truth for profiles.
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: createdAt(),
});

export const questions = pgTable("questions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  text: text("text").notNull().unique(),
  topic: text("topic").notNull(),
  difficulty: questionDifficulty("difficulty").notNull(),
});

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Deleting a user deletes their attempts and evaluations.
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    transcript: text("transcript").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("attempts_user_id_created_at_idx").on(t.userId, t.createdAt),
    index("attempts_user_id_question_id_idx").on(t.userId, t.questionId),
    check("attempts_duration_seconds_non_negative", sql`${t.durationSeconds} >= 0`),
  ],
);

export const evaluations = pgTable(
  "evaluations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .unique()
      .references(() => attempts.id, { onDelete: "cascade" }),
    score: smallint("score").notNull(),
    feedback: text("feedback").notNull(),
    strengths: text("strengths").array().notNull(),
    gaps: text("gaps").array().notNull(),
    tips: text("tips").array().notNull(),
    model: text("model").notNull(),
    createdAt: createdAt(),
  },
  (t) => [check("evaluations_score_range", sql`${t.score} between 0 and 10`)],
);
