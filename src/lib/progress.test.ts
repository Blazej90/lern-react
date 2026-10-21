import { describe, expect, it } from "vitest";
import {
  formatChange,
  formatScore,
  scoreTrend,
  summarizeProgress,
  topicLabel,
  type ProgressData,
  type TimelinePoint,
  type TopicStats,
} from "./progress";

function timeline(scores: number[]): TimelinePoint[] {
  return scores.map((score, i) => ({
    createdAt: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
    score,
    question: "Jak działa useState i kiedy go używamy?",
    topic: "hooks",
  }));
}

function topic(overrides: Partial<TopicStats> & Pick<TopicStats, "topic">): TopicStats {
  return {
    attempts: 0,
    averageScore: null,
    answeredQuestions: 0,
    totalQuestions: 4,
    improvement: null,
    ...overrides,
  };
}

describe("scoreTrend", () => {
  it("returns null below two attempts", () => {
    expect(scoreTrend([])).toBeNull();
    expect(scoreTrend(timeline([7]))).toBeNull();
  });

  it("compares the two halves when there are few attempts", () => {
    expect(scoreTrend(timeline([4, 6, 8]))).toEqual({
      recentAverage: 8,
      previousAverage: 6,
      change: 2,
      window: 1,
    });
  });

  it("compares the last five attempts with the five before", () => {
    const trend = scoreTrend(timeline([0, 0, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6]));

    expect(trend).toEqual({ recentAverage: 6, previousAverage: 2, change: 4, window: 5 });
  });
});

describe("summarizeProgress", () => {
  const empty: ProgressData = {
    topics: [topic({ topic: "hooks" }), topic({ topic: "forms", totalQuestions: 2 })],
    timeline: [],
    unanswered: [],
  };

  it("handles a user with no attempts", () => {
    expect(summarizeProgress(empty)).toEqual({
      attempts: 0,
      averageScore: null,
      answeredQuestions: 0,
      totalQuestions: 6,
      trend: null,
      weakestTopics: [],
      mostImproved: null,
    });
  });

  it("weights the overall average by attempts per topic", () => {
    const summary = summarizeProgress({
      ...empty,
      topics: [
        topic({ topic: "hooks", attempts: 3, averageScore: 8, answeredQuestions: 2 }),
        topic({ topic: "forms", attempts: 1, averageScore: 4, answeredQuestions: 1 }),
      ],
    });

    expect(summary.attempts).toBe(4);
    expect(summary.averageScore).toBe(7);
    expect(summary.answeredQuestions).toBe(3);
  });

  it("lists weakest topics only once two topics are practiced", () => {
    const one = summarizeProgress({
      ...empty,
      topics: [topic({ topic: "hooks", attempts: 1, averageScore: 3 }), topic({ topic: "forms" })],
    });
    expect(one.weakestTopics).toEqual([]);

    const many = summarizeProgress({
      ...empty,
      topics: [
        topic({ topic: "hooks", attempts: 1, averageScore: 6 }),
        topic({ topic: "forms", attempts: 1, averageScore: 3 }),
        topic({ topic: "state", attempts: 1, averageScore: 9 }),
        topic({ topic: "basics" }),
      ],
    });
    expect(many.weakestTopics.map((t) => t.topic)).toEqual(["forms", "hooks"]);
  });

  it("picks the topic with the largest positive improvement", () => {
    const summary = summarizeProgress({
      ...empty,
      topics: [
        topic({ topic: "hooks", attempts: 4, averageScore: 6, improvement: 1 }),
        topic({ topic: "forms", attempts: 4, averageScore: 5, improvement: 3 }),
        topic({ topic: "state", attempts: 2, averageScore: 5, improvement: -2 }),
      ],
    });
    expect(summary.mostImproved?.topic).toBe("forms");

    const declined = summarizeProgress({
      ...empty,
      topics: [topic({ topic: "state", attempts: 2, averageScore: 5, improvement: -2 })],
    });
    expect(declined.mostImproved).toBeNull();
  });
});

describe("formatting", () => {
  it("labels known topics in Polish and keeps unknown ones", () => {
    expect(topicLabel("hooks")).toBe("Hooki");
    expect(topicLabel("legacy")).toBe("legacy");
  });

  it("formats scores and signed changes with a decimal comma", () => {
    expect(formatScore(7.25)).toBe("7,3");
    expect(formatScore(8)).toBe("8");
    expect(formatChange(1.5)).toBe("+1,5");
    expect(formatChange(-0.5)).toBe("-0,5");
    expect(formatChange(0)).toBe("0");
  });
});
