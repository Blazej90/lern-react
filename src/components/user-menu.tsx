"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import { Shield, TrendingUp } from "lucide-react";

// Client-side on purpose: the server <SignedIn> calls auth(), which throws
// when middleware skipped the request (e.g. a 404 for a missing /sw.js).
export function UserMenu() {
  return (
    <SignedIn>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label="Postępy"
            labelIcon={<TrendingUp className="w-4 h-4" />}
            href="/progress"
          />
          <UserButton.Link
            label="Prywatność i dane"
            labelIcon={<Shield className="w-4 h-4" />}
            href="/privacy"
          />
        </UserButton.MenuItems>
      </UserButton>
    </SignedIn>
  );
}
