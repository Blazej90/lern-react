import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, evaluations, questions, users } from "@/db/schema";
import type { Attempt } from "@/lib/attempts";
import type { Evaluation } from "@/lib/evaluation";

const HISTORY_LIMIT = 100;

interface NewAttempt {
  userId: string;
  question: string;
  transcript: string;
  durationSeconds: number;
  evaluation: Evaluation;
  model: string;
}

// Saves the user, the attempt and its evaluation in one transaction
// (neon-http runs a batch as a single transaction).
export async function saveAttempt(input: NewAttempt): Promise<Attempt> {
  const db = getDb();
  const attemptId = crypto.randomUUID();
  const { evaluation } = input;

  const [, [attempt]] = await db.batch([
    db.insert(users).values({ id: input.userId }).onConflictDoNothing(),
    db
      .insert(attempts)
      .values({
        id: attemptId,
        userId: input.userId,
        questionId: sql`(select ${questions.id} from ${questions} where ${questions.text} = ${input.question})`,
        transcript: input.transcript,
        durationSeconds: input.durationSeconds,
      })
      .returning({ createdAt: attempts.createdAt }),
    db.insert(evaluations).values({
      attemptId,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      gaps: evaluation.gaps,
      tips: evaluation.tips,
      model: input.model,
    }),
  ]);

  return {
    id: attemptId,
    question: input.question,
    transcript: input.transcript,
    durationSeconds: input.durationSeconds,
    createdAt: attempt.createdAt.toISOString(),
    evaluation,
  };
}

// The user's most recent attempts, newest first.
export async function getAttempts(userId: string): Promise<Attempt[]> {
  const rows = await getDb()
    .select({
      id: attempts.id,
      question: questions.text,
      transcript: attempts.transcript,
      durationSeconds: attempts.durationSeconds,
      createdAt: attempts.createdAt,
      score: evaluations.score,
      feedback: evaluations.feedback,
      strengths: evaluations.strengths,
      gaps: evaluations.gaps,
      tips: evaluations.tips,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .innerJoin(evaluations, eq(evaluations.attemptId, attempts.id))
    .where(eq(attempts.userId, userId))
    .orderBy(desc(attempts.createdAt))
    .limit(HISTORY_LIMIT);

  return rows.map(({ score, feedback, strengths, gaps, tips, createdAt, ...rest }) => ({
    ...rest,
    createdAt: createdAt.toISOString(),
    evaluation: { score, feedback, strengths, gaps, tips },
  }));
}

// Deletes all of the user's attempts at a question (evaluations cascade).
export async function deleteAttempts(userId: string, question: string): Promise<void> {
  await getDb()
    .delete(attempts)
    .where(
      and(
        eq(attempts.userId, userId),
        inArray(
          attempts.questionId,
          getDb().select({ id: questions.id }).from(questions).where(eq(questions.text, question)),
        ),
      ),
    );
}
