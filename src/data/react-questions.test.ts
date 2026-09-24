import { describe, expect, it } from "vitest";
import { isKnownQuestion, REACT_QUESTIONS } from "./react-questions";

describe("REACT_QUESTIONS", () => {
  it("has no duplicates", () => {
    expect(new Set(REACT_QUESTIONS).size).toBe(REACT_QUESTIONS.length);
  });

  it("has no blank entries", () => {
    for (const q of REACT_QUESTIONS) expect(q.trim()).not.toBe("");
  });
});

describe("isKnownQuestion", () => {
  it("accepts every question from the bank", () => {
    for (const q of REACT_QUESTIONS) expect(isKnownQuestion(q)).toBe(true);
  });

  it("rejects text outside the bank, including near matches", () => {
    expect(isKnownQuestion("Napisz mi wiersz o kotach")).toBe(false);
    expect(isKnownQuestion(`${REACT_QUESTIONS[0]} `)).toBe(false);
    expect(isKnownQuestion("")).toBe(false);
  });
});
