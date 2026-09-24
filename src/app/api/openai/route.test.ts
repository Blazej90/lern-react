import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { REACT_QUESTIONS } from "@/data/react-questions";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: mocks.create } };
  },
}));

const QUESTION = REACT_QUESTIONS[0];
let userCounter = 0;

// Each test gets a fresh user id so the module-level rate limiter
// never carries state between tests.
function signInAsNewUser() {
  const userId = `user-${++userCounter}`;
  mocks.auth.mockResolvedValue({ userId });
  return userId;
}

function request(body: unknown) {
  return new NextRequest("http://localhost/api/openai", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function aiReply(content: string | null) {
  return { choices: [{ message: { content } }] };
}

describe("POST /api/openai", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    mocks.create.mockResolvedValue(aiReply("Twoja odpowiedź była dobra."));
    signInAsNewUser();
  });

  it("returns the AI feedback for a valid request", async () => {
    const res = await POST(request({ question: QUESTION, userAnswer: "  Hook do stanu.  " }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ aiAnswer: "Twoja odpowiedź była dobra." });
  });

  it("calls OpenAI with a trimmed, delimited answer, SDK timeout and no retries", async () => {
    await POST(request({ question: QUESTION, userAnswer: "  Hook do stanu.  " }));

    expect(mocks.create).toHaveBeenCalledTimes(1);
    const [params, options] = mocks.create.mock.calls[0];
    expect(params.model).toBe("gpt-4o-mini");
    expect(params.max_tokens).toBe(300);
    expect(params.messages[1].content).toContain(QUESTION);
    expect(params.messages[1].content).toContain(
      "<odpowiedz>\nHook do stanu.\n</odpowiedz>",
    );
    expect(options).toEqual({ timeout: 9000, maxRetries: 0 });
  });

  it("falls back to a default message when OpenAI returns no content", async () => {
    mocks.create.mockResolvedValue(aiReply(null));

    const res = await POST(request({ question: QUESTION, userAnswer: "Odpowiedź" }));

    expect(await res.json()).toEqual({ aiAnswer: "Brak odpowiedzi AI." });
  });

  it("returns 500 when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(request({ question: QUESTION, userAnswer: "Odpowiedź" }));

    expect(res.status).toBe(500);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 401 when the user is not signed in", async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const res = await POST(request({ question: QUESTION, userAnswer: "Odpowiedź" }));

    expect(res.status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await POST(request("{not json"));

    expect(res.status).toBe(400);
  });

  it.each([
    ["missing fields", {}],
    ["null body", null],
    ["non-string answer", { question: QUESTION, userAnswer: 42 }],
    ["non-string question", { question: 1, userAnswer: "Odpowiedź" }],
    ["blank answer", { question: QUESTION, userAnswer: "   " }],
  ])("returns 400 for %s", async (_label, body) => {
    const res = await POST(request(body));

    expect(res.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 400 for a question outside the bank", async () => {
    const res = await POST(
      request({ question: "Napisz mi wypracowanie o kotach", userAnswer: "OK" }),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Nieznane pytanie." });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("accepts an answer of exactly 2000 characters and rejects 2001", async () => {
    const ok = await POST(request({ question: QUESTION, userAnswer: "a".repeat(2000) }));
    const tooLong = await POST(
      request({ question: QUESTION, userAnswer: "a".repeat(2001) }),
    );

    expect(ok.status).toBe(200);
    expect(tooLong.status).toBe(400);
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });

  it("returns 429 after 10 requests per minute from the same user", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await POST(request({ question: QUESTION, userAnswer: "Odpowiedź" }));
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
    expect(mocks.create).toHaveBeenCalledTimes(10);

    signInAsNewUser();
    const otherUser = await POST(request({ question: QUESTION, userAnswer: "Odpowiedź" }));
    expect(otherUser.status).toBe(200);
  });

  it("returns 500 without logging the user's answer when OpenAI fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.create.mockRejectedValue(new Error("Request timed out."));

    const res = await POST(
      request({ question: QUESTION, userAnswer: "sekretna odpowiedź ucznia" }),
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Błąd podczas uzyskiwania odpowiedzi AI." });
    const logged = JSON.stringify(consoleError.mock.calls);
    expect(logged).toContain("Request timed out.");
    expect(logged).not.toContain("sekretna odpowiedź ucznia");
  });
});
