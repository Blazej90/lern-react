import { describe, expect, it } from "vitest";
import { EVALUATION_JSON_SCHEMA, parseEvaluation } from "./evaluation";

const VALID = {
  score: 6,
  feedback: "Twoja odpowiedź była częściowo poprawna.",
  strengths: ["a"],
  gaps: ["b"],
  tips: [],
};

describe("parseEvaluation", () => {
  it("accepts a valid evaluation", () => {
    expect(parseEvaluation(VALID)).toEqual(VALID);
  });

  it("drops unknown fields", () => {
    expect(parseEvaluation({ ...VALID, extra: true })).toEqual(VALID);
  });

  it.each([
    [-3, 0],
    [12, 10],
    [6.6, 7],
  ])("normalizes score %s to %s", (score, expected) => {
    expect(parseEvaluation({ ...VALID, score })?.score).toBe(expected);
  });

  it.each([
    ["null", null],
    ["a string", "Twoja odpowiedź była dobra."],
    ["an array", [VALID]],
    ["a string score", { ...VALID, score: "6" }],
    ["a NaN score", { ...VALID, score: NaN }],
    ["missing feedback", { ...VALID, feedback: undefined }],
    ["a non-array list", { ...VALID, gaps: "b" }],
    ["a list with non-strings", { ...VALID, tips: [1] }],
  ])("rejects %s", (_label, value) => {
    expect(parseEvaluation(value)).toBeNull();
  });
});

describe("EVALUATION_JSON_SCHEMA", () => {
  // Strict Structured Outputs require every property to be listed as
  // required and additionalProperties to be false.
  it("is valid for strict Structured Outputs", () => {
    expect(EVALUATION_JSON_SCHEMA.required).toEqual(
      Object.keys(EVALUATION_JSON_SCHEMA.properties),
    );
    expect(EVALUATION_JSON_SCHEMA.additionalProperties).toBe(false);
  });
});
