import { loadEnvConfig } from "@next/env";
import { sql } from "drizzle-orm";
import { QUESTION_BANK } from "@/data/react-questions";
import { getDb } from "@/db";
import { questions } from "@/db/schema";

// Upserts the question bank by text. Questions removed from the bank stay
// in the table, because past attempts still reference them.
async function main() {
  // Development mode, like drizzle.config.ts: .env.production* is ignored.
  loadEnvConfig(process.cwd(), true);

  const rows = await getDb()
    .insert(questions)
    .values([...QUESTION_BANK])
    .onConflictDoUpdate({
      target: questions.text,
      set: {
        topic: sql`excluded.topic`,
        difficulty: sql`excluded.difficulty`,
      },
    })
    .returning({ id: questions.id });

  console.log(`Zapisano ${rows.length} pytań w tabeli questions.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
