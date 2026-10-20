import { beforeEach, describe, expect, it, vi } from "vitest";
import { readDemoConfig } from "./demo";
import { isOwner } from "./owner";

const mocks = vi.hoisted(() => ({ currentUser: vi.fn() }));

vi.mock("@clerk/nextjs/server", () => ({ currentUser: mocks.currentUser }));

const config = readDemoConfig({ OWNER_EMAILS: "owner@example.com" });

function userWith(...emails: { emailAddress: string; status: string }[]) {
  return {
    emailAddresses: emails.map(({ emailAddress, status }) => ({
      emailAddress,
      verification: { status },
    })),
  };
}

describe("isOwner", () => {
  beforeEach(() => {
    mocks.currentUser.mockResolvedValue(
      userWith({ emailAddress: "owner@example.com", status: "verified" }),
    );
  });

  it("recognises a verified owner email", async () => {
    expect(await isOwner(config)).toBe(true);
  });

  it("ignores an owner email that is not verified", async () => {
    mocks.currentUser.mockResolvedValue(
      userWith({ emailAddress: "owner@example.com", status: "unverified" }),
    );

    expect(await isOwner(config)).toBe(false);
  });

  it("returns false for other users", async () => {
    mocks.currentUser.mockResolvedValue(
      userWith({ emailAddress: "guest@example.com", status: "verified" }),
    );

    expect(await isOwner(config)).toBe(false);
  });

  it("returns false when there is no user", async () => {
    mocks.currentUser.mockResolvedValue(null);

    expect(await isOwner(config)).toBe(false);
  });

  it("skips the Clerk lookup when no owners are configured", async () => {
    expect(await isOwner(readDemoConfig({}))).toBe(false);
    expect(mocks.currentUser).not.toHaveBeenCalled();
  });
});
