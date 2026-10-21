import { and, asc, desc, eq, inArray, notExists, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, evaluations, questions } from "@/db/schema";
import { REACT_QUESTIONS } from "@/data/react-questions";
import type { ProgressData } from "@/lib/progress";

const TIMELINE_LIMIT = 30;
// Attempts compared at each end of a topic's history for "improvement".
const IMPROVEMENT_WINDOW = 3;

// Questions removed from the bank stay in the table for old attempts, but do
// not count as questions left to practice.
const inBank = () => inArray(questions.text, [...REACT_QUESTIONS]);

// Per-topic stats, the latest scores and unanswered questions, in one round trip.
export async function getProgress(userId: string): Promise<ProgressData> {
  const db = getDb();

  // One row per attempt, numbered from both ends within its topic.
  const ranked = db.$with("ranked").as(
    db
      .select({
        questionId: attempts.questionId,
        score: sql<number>`${evaluations.score}`.as("score"),
        rnAsc: sql<number>`row_number() over (partition by ${questions.topic} order by ${attempts.createdAt})`.as("rn_asc"),
        rnDesc: sql<number>`row_number() over (partition by ${questions.topic} order by ${attempts.createdAt} desc)`.as("rn_desc"),
        topicAttempts: sql<number>`count(*) over (partition by ${questions.topic})`.as("topic_attempts"),
      })
      .from(attempts)
      .innerJoin(evaluations, eq(evaluations.attemptId, attempts.id))
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(eq(attempts.userId, userId)),
  );

  // Compared windows never overlap: at most half of the topic's attempts each.
  const window = sql`least(${IMPROVEMENT_WINDOW}, ${ranked.topicAttempts} / 2)`;

  const [topicRows, timelineRows, unansweredRows] = await db.batch([
    db
      .with(ranked)
      .select({
        topic: questions.topic,
        attempts: sql`count(${ranked.score})`.mapWith(Number),
        averageScore: sql`avg(${ranked.score})`.mapWith(Number),
        answeredQuestions: sql`count(distinct ${ranked.questionId}) filter (where ${inBank()})`.mapWith(Number),
        totalQuestions: sql`count(distinct ${questions.id}) filter (where ${inBank()})`.mapWith(Number),
        improvement: sql`avg(${ranked.score}) filter (where ${ranked.rnDesc} <= ${window})
          - avg(${ranked.score}) filter (where ${ranked.rnAsc} <= ${window})`.mapWith(Number),
      })
      .from(questions)
      .leftJoin(ranked, eq(ranked.questionId, questions.id))
      .groupBy(questions.topic)
      .orderBy(asc(questions.topic)),
    db
      .select({
        createdAt: attempts.createdAt,
        score: evaluations.score,
        question: questions.text,
        topic: questions.topic,
      })
      .from(attempts)
      .innerJoin(evaluations, eq(evaluations.attemptId, attempts.id))
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.createdAt))
      .limit(TIMELINE_LIMIT),
    db
      .select({ text: questions.text, topic: questions.topic })
      .from(questions)
      .where(
        and(
          inBank(),
          notExists(
            db
              .select({ one: sql`1` })
              .from(attempts)
              .where(and(eq(attempts.userId, userId), eq(attempts.questionId, questions.id))),
          ),
        ),
      )
      .orderBy(asc(questions.topic), asc(questions.id)),
  ]);

  return {
    topics: topicRows.map((row) => ({
      ...row,
      averageScore: row.attempts > 0 ? row.averageScore : null,
      improvement: row.attempts >= 2 ? row.improvement : null,
    })),
    timeline: timelineRows
      .map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
      .reverse(),
    unanswered: unansweredRows,
  };
}
