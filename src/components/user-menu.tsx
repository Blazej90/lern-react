"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";

// Client-side on purpose: the server <SignedIn> calls auth(), which throws
// when middleware skipped the request (e.g. a 404 for a missing /sw.js).
export function UserMenu() {
  return (
    <SignedIn>
      <UserButton />
    </SignedIn>
  );
}
