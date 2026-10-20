import { parseEvaluation, type Evaluation } from "@/lib/evaluation";

// Persists AI feedback per question in localStorage. Every access is guarded:
// storage can be unavailable (private mode, blocked cookies) or corrupted.
const STORAGE_KEY = "aiResponses";
const MAX_VERSIONS_PER_QUESTION = 5;

// Plain strings are free-text feedback saved before structured evaluations.
export type StoredAIResponse = string | Evaluation;

type StoredResponses = Record<string, StoredAIResponse[]>;

function parseStoredResponse(value: unknown): StoredAIResponse | null {
  return typeof value === "string" ? value : parseEvaluation(value);
}

function readAll(): StoredResponses {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const result: StoredResponses = {};
    for (const [question, responses] of Object.entries(parsed)) {
      if (Array.isArray(responses)) {
        result[question] = responses
          .map(parseStoredResponse)
          .filter((r): r is StoredAIResponse => r !== null);
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

export function getAIResponses(question: string): StoredAIResponse[] {
  return readAll()[question] ?? [];
}

export function addAIResponse(question: string, response: StoredAIResponse): void {
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
