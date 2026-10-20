import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  isOwner: vi.fn(),
  getDemoUsage: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/owner", () => ({ isOwner: mocks.isOwner }));
vi.mock("@/db/demo", () => ({ getDemoUsage: mocks.getDemoUsage }));

describe("GET /api/demo", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ userId: "user-1" });
    mocks.isOwner.mockResolvedValue(false);
    mocks.getDemoUsage.mockResolvedValue({ userUsed: 1, dayUsed: 4 });
  });

  it("returns the demo status of a guest", async () => {
    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      demo: { mode: "demo", limit: 3, remaining: 2, dailyLimitReached: false },
    });
    expect(mocks.getDemoUsage).toHaveBeenCalledWith("user-1");
  });

  it("returns owner mode for an owner", async () => {
    mocks.isOwner.mockResolvedValue(true);

    const res = await GET();

    expect(await res.json()).toEqual({ demo: { mode: "owner" } });
    expect(mocks.getDemoUsage).not.toHaveBeenCalled();
  });

  it("returns 401 when the user is not signed in", async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("returns 500 when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getDemoUsage.mockRejectedValue(new Error("connection refused"));

    const res = await GET();

    expect(res.status).toBe(500);
  });
});
