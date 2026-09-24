import { describe, expect, it } from "vitest";
import { cn, formatTime } from "./utils";

describe("formatTime", () => {
  it.each([
    [0, "00:00"],
    [5, "00:05"],
    [65, "01:05"],
    [599, "09:59"],
    [3599, "59:59"],
  ])("formats %i seconds as %s", (seconds, expected) => {
    expect(formatTime(seconds)).toBe(expected);
  });

  it("adds hours from one hour up", () => {
    expect(formatTime(3600)).toBe("01:00:00");
    expect(formatTime(3725)).toBe("01:02:05");
  });
});

describe("cn", () => {
  it("merges conflicting Tailwind classes, keeping the last one", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
