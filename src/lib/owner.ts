import { currentUser } from "@clerk/nextjs/server";
import { isOwnerEmail, type DemoConfig } from "@/lib/demo";

// Owners (OWNER_EMAILS) have no demo limit. Only emails verified by Clerk
// count, so nobody can claim an owner address they do not control.
export async function isOwner(config: DemoConfig): Promise<boolean> {
  if (config.ownerEmails.size === 0) return false;

  const user = await currentUser();
  const verifiedEmails =
    user?.emailAddresses
      .filter((email) => email.verification?.status === "verified")
      .map((email) => email.emailAddress) ?? [];

  return isOwnerEmail(config, verifiedEmails);
}
