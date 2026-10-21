import { QUESTION_TOPICS, type QuestionTopic } from "@/data/react-questions";

// Aggregates for one topic, computed in SQL (src/db/progress.ts).
export interface TopicStats {
  topic: string;
  attempts: number;
  // null when the topic has no attempts yet.
  averageScore: number | null;
  answeredQuestions: number;
  totalQuestions: number;
  // Average of the latest attempts minus the earliest ones; null below 2 attempts.
  improvement: number | null;
}

export interface TimelinePoint {
  createdAt: string;
  score: number;
  question: string;
  topic: string;
}

export interface UnansweredQuestion {
  text: string;
  topic: string;
}

export interface ProgressData {
  topics: TopicStats[];
  // The most recent attempts, oldest first.
  timeline: TimelinePoint[];
  unanswered: UnansweredQuestion[];
}

export interface ScoreTrend {
  recentAverage: number;
  previousAverage: number;
  change: number;
  // Attempts in each of the two compared windows.
  window: number;
}

export interface ProgressSummary {
  attempts: number;
  averageScore: number | null;
  answeredQuestions: number;
  totalQuestions: number;
  trend: ScoreTrend | null;
  // Lowest averages first; empty until at least two topics are practiced.
  weakestTopics: TopicStats[];
  mostImproved: TopicStats | null;
}

export const TREND_WINDOW = 5;
const WEAKEST_TOPICS = 2;

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Compares the last attempts with the ones right before them.
export function scoreTrend(timeline: TimelinePoint[]): ScoreTrend | null {
  const window = Math.min(TREND_WINDOW, Math.floor(timeline.length / 2));
  if (window === 0) return null;

  const scores = timeline.map((point) => point.score);
  const recentAverage = average(scores.slice(-window));
  const previousAverage = average(scores.slice(-2 * window, -window));
  return { recentAverage, previousAverage, change: recentAverage - previousAverage, window };
}

export function summarizeProgress({ topics, timeline }: ProgressData): ProgressSummary {
  const practiced = topics.filter((t) => t.attempts > 0);
  const attempts = practiced.reduce((sum, t) => sum + t.attempts, 0);
  const scoreSum = practiced.reduce((sum, t) => sum + (t.averageScore ?? 0) * t.attempts, 0);

  const byScore = [...practiced].sort((a, b) => (a.averageScore ?? 0) - (b.averageScore ?? 0));
  const improved = practiced
    .filter((t) => (t.improvement ?? 0) > 0)
    .sort((a, b) => (b.improvement ?? 0) - (a.improvement ?? 0));

  return {
    attempts,
    averageScore: attempts > 0 ? scoreSum / attempts : null,
    answeredQuestions: topics.reduce((sum, t) => sum + t.answeredQuestions, 0),
    totalQuestions: topics.reduce((sum, t) => sum + t.totalQuestions, 0),
    trend: scoreTrend(timeline),
    weakestTopics: practiced.length >= 2 ? byScore.slice(0, WEAKEST_TOPICS) : [],
    mostImproved: improved[0] ?? null,
  };
}

export function topicLabel(topic: string): string {
  return QUESTION_TOPICS[topic as QuestionTopic] ?? topic;
}

const scoreFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 });
const changeFormat = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/** Formats an average score with at most one decimal, e.g. "7,3". */
export function formatScore(score: number): string {
  return scoreFormat.format(score);
}

/** Formats a score change with its sign, e.g. "+1,5", "-0,5" or "0". */
export function formatChange(change: number): string {
  return changeFormat.format(change);
}
