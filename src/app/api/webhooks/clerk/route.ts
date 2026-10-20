import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { deleteUser } from "@/db/user-data";

interface ClerkEvent {
  type: string;
  data: { id?: string };
}

// Clerk calls this after account changes. Signed with Svix, so only Clerk can
// trigger it; the route is public in middleware. Deleting the Clerk account
// deletes all of the user's data here (right to erasure).
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    console.error("Brakuje CLERK_WEBHOOK_SIGNING_SECRET w środowisku.");
    return NextResponse.json({ error: "Brak konfiguracji webhooka." }, { status: 500 });
  }

  const payload = await req.text();
  let event: ClerkEvent;
  try {
    // Throws when the signature or timestamp is invalid.
    new Webhook(secret).verify(payload, {
      "svix-id": req.headers.get("svix-id") ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    });
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy podpis." }, { status: 400 });
  }

  if (event.type !== "user.deleted" || !event.data?.id) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await deleteUser(event.data.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // A 5xx makes Clerk retry the delivery later.
    console.error(
      "❌ Nie udało się usunąć danych użytkownika:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: "Nie udało się usunąć danych." }, { status: 500 });
  }
}
