// Demo mode: everyone except the owners gets a few evaluations to try the app,
// so the owner's OpenAI key cannot be drained.

export const DEFAULT_DEMO_QUESTION_LIMIT = 3;
export const DEFAULT_DEMO_DAILY_LIMIT = 20;

export type DemoStatus =
  | { mode: "owner" }
  | {
      mode: "demo";
      limit: number;
      remaining: number;
      // All demo users together used today's allowance.
      dailyLimitReached: boolean;
    };

export interface DemoConfig {
  ownerEmails: Set<string>;
  questionLimit: number;
  dailyLimit: number;
}

function parseLimit(value: string | undefined, fallback: number) {
  if (!value?.trim()) return fallback;
  const limit = Number(value);
  return Number.isInteger(limit) && limit >= 0 ? limit : fallback;
}

export function readDemoConfig(env: Record<string, string | undefined> = process.env): DemoConfig {
  return {
    ownerEmails: new Set(
      (env.OWNER_EMAILS ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
    questionLimit: parseLimit(env.DEMO_QUESTION_LIMIT, DEFAULT_DEMO_QUESTION_LIMIT),
    dailyLimit: parseLimit(env.DEMO_DAILY_LIMIT, DEFAULT_DEMO_DAILY_LIMIT),
  };
}

export function isOwnerEmail(config: DemoConfig, verifiedEmails: string[]) {
  return verifiedEmails.some((email) => config.ownerEmails.has(email.toLowerCase()));
}

export function demoStatus(config: DemoConfig, userUsed: number, dayUsed: number): DemoStatus {
  return {
    mode: "demo",
    limit: config.questionLimit,
    remaining: Math.max(config.questionLimit - userUsed, 0),
    dailyLimitReached: dayUsed >= config.dailyLimit,
  };
}

// "1 pytanie", "3 pytania", "5 pytań"
export function formatQuestionCount(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (count === 1) return "1 pytanie";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${count} pytania`;
  return `${count} pytań`;
}

// Why a demo user cannot get an evaluation right now, or null if they can.
export function demoBlockReason(status: DemoStatus): string | null {
  if (status.mode === "owner") return null;
  if (status.limit === 0) return "Wersja demonstracyjna jest obecnie wyłączona.";
  if (status.remaining === 0) {
    return "Limit pytań w wersji demonstracyjnej został wykorzystany. Dziękuję za wypróbowanie aplikacji!";
  }
  if (status.dailyLimitReached) {
    return "Dzienny limit wersji demonstracyjnej został wyczerpany. Spróbuj ponownie jutro.";
  }
  return null;
}
