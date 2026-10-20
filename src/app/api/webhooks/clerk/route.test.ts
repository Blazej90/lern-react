import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({ deleteUser: vi.fn() }));

vi.mock("@/db/user-data", () => ({ deleteUser: mocks.deleteUser }));

const SECRET = `whsec_${Buffer.from("test-signing-secret-32-bytes!!!!").toString("base64")}`;

function signedRequest(event: unknown, secret = SECRET) {
  const payload = JSON.stringify(event);
  const id = "msg_1";
  const timestamp = new Date();
  const signature = new Webhook(secret).sign(id, timestamp, payload);

  return new NextRequest("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body: payload,
    headers: {
      "svix-id": id,
      "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
      "svix-signature": signature,
    },
  });
}

const USER_DELETED = { type: "user.deleted", data: { id: "user_123", deleted: true } };

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    vi.stubEnv("CLERK_WEBHOOK_SIGNING_SECRET", SECRET);
    mocks.deleteUser.mockResolvedValue(undefined);
  });

  it("deletes all of the user's data when the Clerk account is deleted", async () => {
    const res = await POST(signedRequest(USER_DELETED));

    expect(res.status).toBe(204);
    expect(mocks.deleteUser).toHaveBeenCalledWith("user_123");
  });

  it("ignores other events", async () => {
    const res = await POST(signedRequest({ type: "user.updated", data: { id: "user_123" } }));

    expect(res.status).toBe(204);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("rejects a request signed with another secret", async () => {
    const other = `whsec_${Buffer.from("another-secret-of-32-bytes-long!").toString("base64")}`;

    const res = await POST(signedRequest(USER_DELETED, other));

    expect(res.status).toBe(400);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("rejects an unsigned request", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(USER_DELETED),
      }),
    );

    expect(res.status).toBe(400);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("returns 500 when the signing secret is missing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("CLERK_WEBHOOK_SIGNING_SECRET", "");

    const res = await POST(signedRequest(USER_DELETED));

    expect(res.status).toBe(500);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("returns 500 so Clerk retries when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.deleteUser.mockRejectedValue(new Error("connection refused"));

    const res = await POST(signedRequest(USER_DELETED));

    expect(res.status).toBe(500);
  });
});
