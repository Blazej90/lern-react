import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isRateLimited } from "./rate-limit";

// The limiter keeps module-level state, so each test uses its own key.
describe("isRateLimited", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit and blocks the next one", () => {
    const results = Array.from({ length: 4 }, () =>
      isRateLimited("user-limit", 3, 60_000),
    );

    expect(results).toEqual([false, false, false, true]);
  });

  it("allows requests again once the window has passed", () => {
    for (let i = 0; i < 3; i++) isRateLimited("user-window", 3, 60_000);
    expect(isRateLimited("user-window", 3, 60_000)).toBe(true);

    vi.advanceTimersByTime(60_000);

    expect(isRateLimited("user-window", 3, 60_000)).toBe(false);
  });

  it("uses a sliding window rather than a fixed one", () => {
    isRateLimited("user-sliding", 2, 60_000);
    vi.advanceTimersByTime(30_000);
    isRateLimited("user-sliding", 2, 60_000);

    // First hit expires at 60 s, the second only at 90 s.
    vi.advanceTimersByTime(30_000);
    expect(isRateLimited("user-sliding", 2, 60_000)).toBe(false);
    expect(isRateLimited("user-sliding", 2, 60_000)).toBe(true);
  });

  it("does not count blocked requests against the limit", () => {
    isRateLimited("user-blocked", 1, 60_000);
    vi.advanceTimersByTime(30_000);
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited("user-blocked", 1, 60_000)).toBe(true);
    }

    // The allowed hit (t=0) has expired. Had the blocked ones (t=30 s) been
    // recorded, the key would still be limited here.
    vi.advanceTimersByTime(30_000);

    expect(isRateLimited("user-blocked", 1, 60_000)).toBe(false);
  });

  it("tracks keys independently", () => {
    isRateLimited("user-a", 1, 60_000);

    expect(isRateLimited("user-a", 1, 60_000)).toBe(true);
    expect(isRateLimited("user-b", 1, 60_000)).toBe(false);
  });
});
