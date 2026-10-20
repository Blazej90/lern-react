import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteAttempts, getAttempts } from "@/db/attempts";

function unauthorized() {
  return NextResponse.json(
    { error: "Brak autoryzacji. Proszę się zalogować." },
    { status: 401 },
  );
}

function logError(action: string, error: unknown) {
  console.error(
    `❌ Błąd podczas ${action} historii:`,
    error instanceof Error ? error.message : error,
  );
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    return NextResponse.json({ attempts: await getAttempts(userId) });
  } catch (error) {
    logError("pobierania", error);
    return NextResponse.json(
      { error: "Nie udało się wczytać historii odpowiedzi." },
      { status: 500 },
    );
  }
}

// Deletes the signed-in user's attempts at one question: { question }.
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  let question: unknown;
  try {
    ({ question } = (await req.json()) ?? {});
  } catch {
    // Handled by the type check below.
  }

  if (typeof question !== "string" || !question) {
    return NextResponse.json({ error: "Brak pytania." }, { status: 400 });
  }

  try {
    await deleteAttempts(userId, question);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logError("usuwania", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć odpowiedzi." },
      { status: 500 },
    );
  }
}
