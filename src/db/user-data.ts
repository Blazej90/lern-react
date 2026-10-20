import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, evaluations, questions, users } from "@/db/schema";

export interface UserDataExport {
  exportedAt: string;
  user: { id: string; createdAt: string; demoUsed: number } | null;
  attempts: {
    id: string;
    question: string;
    transcript: string;
    durationSeconds: number;
    createdAt: string;
    evaluation: {
      score: number;
      feedback: string;
      strengths: string[];
      gaps: string[];
      tips: string[];
      model: string;
      createdAt: string;
    };
  }[];
}

// Everything stored about the user, oldest attempt first (right of access).
export async function exportUserData(userId: string): Promise<UserDataExport> {
  const db = getDb();
  const [userRows, attemptRows] = await db.batch([
    db.select().from(users).where(eq(users.id, userId)),
    db
      .select({
        id: attempts.id,
        question: questions.text,
        transcript: attempts.transcript,
        durationSeconds: attempts.durationSeconds,
        createdAt: attempts.createdAt,
        evaluation: {
          score: evaluations.score,
          feedback: evaluations.feedback,
          strengths: evaluations.strengths,
          gaps: evaluations.gaps,
          tips: evaluations.tips,
          model: evaluations.model,
          createdAt: evaluations.createdAt,
        },
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .innerJoin(evaluations, eq(evaluations.attemptId, attempts.id))
      .where(eq(attempts.userId, userId))
      .orderBy(asc(attempts.createdAt)),
  ]);

  const [user] = userRows;
  return {
    exportedAt: new Date().toISOString(),
    user: user
      ? { id: user.id, createdAt: user.createdAt.toISOString(), demoUsed: user.demoUsed }
      : null,
    attempts: attemptRows.map(({ createdAt, evaluation, ...rest }) => ({
      ...rest,
      createdAt: createdAt.toISOString(),
      evaluation: { ...evaluation, createdAt: evaluation.createdAt.toISOString() },
    })),
  };
}

// Deletes every answer and evaluation (cascade). The user row and its demo
// counter stay, so deleting the history does not reset the demo limit.
export async function deleteUserHistory(userId: string): Promise<void> {
  await getDb().delete(attempts).where(eq(attempts.userId, userId));
}

// Removes the user and all their data (cascade); used when the Clerk account
// is deleted.
export async function deleteUser(userId: string): Promise<void> {
  await getDb().delete(users).where(eq(users.id, userId));
}
