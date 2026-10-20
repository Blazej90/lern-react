import { describe, expect, it } from "vitest";
import {
  demoBlockReason,
  demoStatus,
  formatQuestionCount,
  isOwnerEmail,
  readDemoConfig,
} from "./demo";

describe("readDemoConfig", () => {
  it("uses the defaults when nothing is set", () => {
    expect(readDemoConfig({})).toEqual({
      ownerEmails: new Set(),
      questionLimit: 3,
      dailyLimit: 20,
    });
  });

  it("reads owner emails and limits", () => {
    const config = readDemoConfig({
      OWNER_EMAILS: " Owner@Example.com, second@example.com ,",
      DEMO_QUESTION_LIMIT: "5",
      DEMO_DAILY_LIMIT: "0",
    });

    expect(config.ownerEmails).toEqual(new Set(["owner@example.com", "second@example.com"]));
    expect(config.questionLimit).toBe(5);
    expect(config.dailyLimit).toBe(0);
  });

  it.each(["-1", "1.5", "abc", " "])("falls back to the default for %j", (value) => {
    expect(readDemoConfig({ DEMO_QUESTION_LIMIT: value }).questionLimit).toBe(3);
  });
});

describe("isOwnerEmail", () => {
  const config = readDemoConfig({ OWNER_EMAILS: "owner@example.com" });

  it("matches owner emails case-insensitively", () => {
    expect(isOwnerEmail(config, ["other@example.com", "OWNER@example.com"])).toBe(true);
  });

  it("rejects other emails", () => {
    expect(isOwnerEmail(config, ["other@example.com"])).toBe(false);
    expect(isOwnerEmail(config, [])).toBe(false);
  });
});

describe("demoStatus and demoBlockReason", () => {
  const config = readDemoConfig({});

  it("allows a user with uses left", () => {
    const status = demoStatus(config, 1, 5);

    expect(status).toEqual({ mode: "demo", limit: 3, remaining: 2, dailyLimitReached: false });
    expect(demoBlockReason(status)).toBeNull();
  });

  it("blocks a user who used every question", () => {
    expect(demoBlockReason(demoStatus(config, 3, 5))).toMatch(/limit pytań/i);
  });

  it("never reports a negative remaining count after the limit was lowered", () => {
    expect(demoStatus(config, 7, 0)).toMatchObject({ remaining: 0 });
  });

  it("blocks everyone in demo mode when today's limit is reached", () => {
    expect(demoBlockReason(demoStatus(config, 0, 20))).toMatch(/dzienny limit/i);
  });

  it("reports demo mode as off when the question limit is 0", () => {
    const off = readDemoConfig({ DEMO_QUESTION_LIMIT: "0" });

    expect(demoBlockReason(demoStatus(off, 0, 0))).toMatch(/wyłączona/i);
  });

  it("never blocks owners", () => {
    expect(demoBlockReason({ mode: "owner" })).toBeNull();
  });
});

describe("formatQuestionCount", () => {
  it.each([
    [1, "1 pytanie"],
    [2, "2 pytania"],
    [4, "4 pytania"],
    [5, "5 pytań"],
    [12, "12 pytań"],
    [22, "22 pytania"],
    [25, "25 pytań"],
  ])("formats %i as %j", (count, expected) => {
    expect(formatQuestionCount(count)).toBe(expected);
  });
});
