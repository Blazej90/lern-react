import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDemoUsage } from "@/db/demo";
import { demoStatus, readDemoConfig, type DemoStatus } from "@/lib/demo";
import { isOwner } from "@/lib/owner";

// The signed-in user's demo status: { demo: DemoStatus }.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Brak autoryzacji. Proszę się zalogować." },
      { status: 401 },
    );
  }

  try {
    const config = readDemoConfig();
    let demo: DemoStatus = { mode: "owner" };
    if (!(await isOwner(config))) {
      const { userUsed, dayUsed } = await getDemoUsage(userId);
      demo = demoStatus(config, userUsed, dayUsed);
    }
    return NextResponse.json({ demo });
  } catch (error) {
    console.error(
      "❌ Błąd podczas sprawdzania wersji demo:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Nie udało się sprawdzić limitu wersji demo." },
      { status: 500 },
    );
  }
}
