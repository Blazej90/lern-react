import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, GET } from "./route";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getAttempts: vi.fn(),
  deleteAttempts: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));

vi.mock("@/db/attempts", () => ({
  getAttempts: mocks.getAttempts,
  deleteAttempts: mocks.deleteAttempts,
}));

const ATTEMPT = {
  id: "attempt-1",
  question: "Jak działa useState i kiedy go używamy?",
  transcript: "Hook do stanu.",
  durationSeconds: 30,
  createdAt: "2026-10-20T12:00:00.000Z",
  evaluation: { score: 7, feedback: "Dobrze.", strengths: [], gaps: [], tips: [] },
};

function deleteRequest(body: unknown) {
  return new NextRequest("http://localhost/api/attempts", {
    method: "DELETE",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("/api/attempts", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ userId: "user-1" });
    mocks.getAttempts.mockResolvedValue([ATTEMPT]);
    mocks.deleteAttempts.mockResolvedValue(undefined);
  });

  describe("GET", () => {
    it("returns the signed-in user's attempts", async () => {
      const res = await GET();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ attempts: [ATTEMPT] });
      expect(mocks.getAttempts).toHaveBeenCalledWith("user-1");
    });

    it("returns 401 when the user is not signed in", async () => {
      mocks.auth.mockResolvedValue({ userId: null });

      const res = await GET();

      expect(res.status).toBe(401);
      expect(mocks.getAttempts).not.toHaveBeenCalled();
    });

    it("returns 500 when the database fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.getAttempts.mockRejectedValue(new Error("connection refused"));

      const res = await GET();

      expect(res.status).toBe(500);
    });
  });

  describe("DELETE", () => {
    it("deletes the signed-in user's attempts at a question", async () => {
      const res = await DELETE(deleteRequest({ question: ATTEMPT.question }));

      expect(res.status).toBe(204);
      expect(mocks.deleteAttempts).toHaveBeenCalledWith("user-1", ATTEMPT.question);
    });

    it("returns 401 when the user is not signed in", async () => {
      mocks.auth.mockResolvedValue({ userId: null });

      const res = await DELETE(deleteRequest({ question: ATTEMPT.question }));

      expect(res.status).toBe(401);
      expect(mocks.deleteAttempts).not.toHaveBeenCalled();
    });

    it.each([
      ["malformed JSON", "{not json"],
      ["null body", null],
      ["missing question", {}],
      ["empty question", { question: "" }],
      ["non-string question", { question: 1 }],
    ])("returns 400 for %s", async (_label, body) => {
      const res = await DELETE(deleteRequest(body));

      expect(res.status).toBe(400);
      expect(mocks.deleteAttempts).not.toHaveBeenCalled();
    });

    it("returns 500 when the database fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.deleteAttempts.mockRejectedValue(new Error("connection refused"));

      const res = await DELETE(deleteRequest({ question: ATTEMPT.question }));

      expect(res.status).toBe(500);
    });
  });
});
