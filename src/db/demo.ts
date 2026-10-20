import { and, eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { demoUsage, users } from "@/db/schema";

const today = sql`(now() at time zone 'utc')::date`;

interface DemoUsage {
  userUsed: number;
  dayUsed: number;
}

export type DemoReservation =
  | ({ reserved: true; day: string } & DemoUsage)
  | ({ reserved: false } & DemoUsage);

export async function getDemoUsage(userId: string): Promise<DemoUsage> {
  const db = getDb();
  const [userRows, dayRows] = await db.batch([
    db.select({ used: users.demoUsed }).from(users).where(eq(users.id, userId)),
    db.select({ used: demoUsage.used }).from(demoUsage).where(eq(demoUsage.day, today)),
  ]);
  return { userUsed: userRows[0]?.used ?? 0, dayUsed: dayRows[0]?.used ?? 0 };
}

function decrement(column: typeof users.demoUsed | typeof demoUsage.used) {
  return sql`greatest(${column} - 1, 0)`;
}

// Takes one demo evaluation from the user's and today's allowance before
// OpenAI is called. Each step is a single conditional UPDATE, so concurrent
// requests cannot go over either limit.
export async function reserveDemoUse(
  userId: string,
  limits: { questionLimit: number; dailyLimit: number },
): Promise<DemoReservation> {
  if (limits.questionLimit > 0 && limits.dailyLimit > 0) {
    const db = getDb();
    const [, [user]] = await db.batch([
      db.insert(users).values({ id: userId }).onConflictDoNothing(),
      db
        .update(users)
        .set({ demoUsed: sql`${users.demoUsed} + 1` })
        .where(and(eq(users.id, userId), lt(users.demoUsed, limits.questionLimit)))
        .returning({ used: users.demoUsed }),
    ]);

    if (user) {
      const [day] = await db
        .insert(demoUsage)
        .values({ day: today, used: 1 })
        .onConflictDoUpdate({
          target: demoUsage.day,
          set: { used: sql`${demoUsage.used} + 1` },
          setWhere: lt(demoUsage.used, limits.dailyLimit),
        })
        .returning({ day: demoUsage.day, used: demoUsage.used });

      if (day) return { reserved: true, day: day.day, userUsed: user.used, dayUsed: day.used };

      // Today's limit is reached: give the user's use back.
      await db
        .update(users)
        .set({ demoUsed: decrement(users.demoUsed) })
        .where(eq(users.id, userId));
    }
  }

  return { reserved: false, ...(await getDemoUsage(userId)) };
}

// Gives back a reserved use when no evaluation was produced.
export async function releaseDemoUse(userId: string, day: string): Promise<void> {
  const db = getDb();
  await db.batch([
    db.update(users).set({ demoUsed: decrement(users.demoUsed) }).where(eq(users.id, userId)),
    db.update(demoUsage).set({ used: decrement(demoUsage.used) }).where(eq(demoUsage.day, day)),
  ]);
}
