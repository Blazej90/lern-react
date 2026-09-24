// Persists AI feedback per question in localStorage. Every access is guarded:
// storage can be unavailable (private mode, blocked cookies) or corrupted.
const STORAGE_KEY = "aiResponses";
const MAX_VERSIONS_PER_QUESTION = 5;

type StoredResponses = Record<string, string[]>;

function readAll(): StoredResponses {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const result: StoredResponses = {};
    for (const [question, responses] of Object.entries(parsed)) {
      if (Array.isArray(responses)) {
        result[question] = responses.filter(
          (r): r is string => typeof r === "string",
        );
      }
    }
    return result;
  } catch {
    return {};
  }
}

function writeAll(data: StoredResponses): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable; history is a convenience, so ignore.
  }
}

export function getAIResponses(question: string): string[] {
  return readAll()[question] ?? [];
}

export function addAIResponse(question: string, response: string): void {
  const data = readAll();
  data[question] = [...(data[question] ?? []), response].slice(
    -MAX_VERSIONS_PER_QUESTION,
  );
  writeAll(data);
}

export function removeAIResponses(question: string): void {
  const data = readAll();
  delete data[question];
  writeAll(data);
}
