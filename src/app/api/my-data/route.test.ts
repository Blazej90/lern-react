import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET } from "./route";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  exportUserData: vi.fn(),
  deleteUserHistory: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));

vi.mock("@/db/user-data", () => ({
  exportUserData: mocks.exportUserData,
  deleteUserHistory: mocks.deleteUserHistory,
}));

const EXPORT = {
  exportedAt: "2026-10-20T12:00:00.000Z",
  user: { id: "user-1", createdAt: "2026-10-01T12:00:00.000Z", demoUsed: 2 },
  attempts: [],
};

describe("/api/my-data", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ userId: "user-1" });
    mocks.exportUserData.mockResolvedValue(EXPORT);
    mocks.deleteUserHistory.mockResolvedValue(undefined);
  });

  describe("GET", () => {
    it("downloads the signed-in user's data as a JSON file", async () => {
      const res = await GET();

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Disposition")).toMatch(/^attachment; filename=".+\.json"$/);
      expect(res.headers.get("Cache-Control")).toBe("no-store");
      expect(await res.json()).toEqual(EXPORT);
      expect(mocks.exportUserData).toHaveBeenCalledWith("user-1");
    });

    it("returns 401 when the user is not signed in", async () => {
      mocks.auth.mockResolvedValue({ userId: null });

      const res = await GET();

      expect(res.status).toBe(401);
      expect(mocks.exportUserData).not.toHaveBeenCalled();
    });

    it("returns 500 when the database fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.exportUserData.mockRejectedValue(new Error("connection refused"));

      const res = await GET();

      expect(res.status).toBe(500);
    });
  });

  describe("DELETE", () => {
    it("deletes the signed-in user's history", async () => {
      const res = await DELETE();

      expect(res.status).toBe(204);
      expect(mocks.deleteUserHistory).toHaveBeenCalledWith("user-1");
    });

    it("returns 401 when the user is not signed in", async () => {
      mocks.auth.mockResolvedValue({ userId: null });

      const res = await DELETE();

      expect(res.status).toBe(401);
      expect(mocks.deleteUserHistory).not.toHaveBeenCalled();
    });

    it("returns 500 when the database fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.deleteUserHistory.mockRejectedValue(new Error("connection refused"));

      const res = await DELETE();

      expect(res.status).toBe(500);
    });
  });
});
