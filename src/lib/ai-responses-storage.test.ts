import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addAIResponse,
  getAIResponses,
  removeAIResponses,
} from "./ai-responses-storage";

const STORAGE_KEY = "aiResponses";

function createMemoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, String(value)),
  };
}

describe("ai-responses-storage", () => {
  let storage: ReturnType<typeof createMemoryStorage>;

  beforeEach(() => {
    storage = createMemoryStorage();
    vi.stubGlobal("localStorage", storage);
  });

  it("returns an empty list for an unknown question", () => {
    expect(getAIResponses("q")).toEqual([]);
  });

  it("stores responses per question in insertion order", () => {
    addAIResponse("q1", "a");
    addAIResponse("q1", "b");
    addAIResponse("q2", "c");

    expect(getAIResponses("q1")).toEqual(["a", "b"]);
    expect(getAIResponses("q2")).toEqual(["c"]);
  });

  it("keeps only the 5 most recent versions per question", () => {
    for (let i = 1; i <= 7; i++) addAIResponse("q", `v${i}`);

    expect(getAIResponses("q")).toEqual(["v3", "v4", "v5", "v6", "v7"]);
  });

  it("removes all responses for a question and leaves others intact", () => {
    addAIResponse("q1", "a");
    addAIResponse("q2", "b");

    removeAIResponses("q1");

    expect(getAIResponses("q1")).toEqual([]);
    expect(getAIResponses("q2")).toEqual(["b"]);
  });

  it("treats corrupted JSON as empty storage", () => {
    storage.setItem(STORAGE_KEY, "{not json");

    expect(getAIResponses("q")).toEqual([]);
    addAIResponse("q", "a");
    expect(getAIResponses("q")).toEqual(["a"]);
  });

  it("ignores values of the wrong shape", () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ q: ["a", 1, null, "b"], other: "not-an-array" }),
    );

    expect(getAIResponses("q")).toEqual(["a", "b"]);
    expect(getAIResponses("other")).toEqual([]);
  });

  it("ignores a stored array at the top level", () => {
    storage.setItem(STORAGE_KEY, JSON.stringify(["a", "b"]));

    expect(getAIResponses("0")).toEqual([]);
  });

  it("does not throw when storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });

    expect(getAIResponses("q")).toEqual([]);
    expect(() => addAIResponse("q", "a")).not.toThrow();
    expect(() => removeAIResponses("q")).not.toThrow();
  });
});
