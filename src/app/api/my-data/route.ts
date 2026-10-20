import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteUserHistory, exportUserData } from "@/db/user-data";

function unauthorized() {
  return NextResponse.json(
    { error: "Brak autoryzacji. Proszę się zalogować." },
    { status: 401 },
  );
}

function logError(action: string, error: unknown) {
  console.error(
    `❌ Błąd podczas ${action} danych użytkownika:`,
    error instanceof Error ? error.message : error,
  );
}

// Downloads everything stored about the signed-in user as JSON.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    const data = await exportUserData(userId);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="learn-react-dane.json"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logError("eksportu", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać danych." },
      { status: 500 },
    );
  }
}

// Deletes the signed-in user's whole answer history.
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  try {
    await deleteUserHistory(userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logError("usuwania", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć danych." },
      { status: 500 },
    );
  }
}
