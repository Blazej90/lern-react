// Structured AI evaluation of a single answer. The JSON schema is sent to
// OpenAI (Structured Outputs), and parseEvaluation validates the same shape
// wherever it comes from: the model, the API response or localStorage.
export interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  tips: string[];
}

export const MIN_SCORE = 0;
export const MAX_SCORE = 10;

export const EVALUATION_JSON_SCHEMA = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      description: `Ocena odpowiedzi w skali ${MIN_SCORE}–${MAX_SCORE}.`,
    },
    feedback: {
      type: "string",
      description:
        'Krótkie podsumowanie oceny (2–3 zdania), zaczynające się od "Twoja odpowiedź była...".',
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "Co było poprawne (maksymalnie 3 krótkie punkty).",
    },
    gaps: {
      type: "array",
      items: { type: "string" },
      description: "Czego brakowało lub co było błędne (maksymalnie 3 krótkie punkty).",
    },
    tips: {
      type: "array",
      items: { type: "string" },
      description: "Wskazówki, jak poprawić odpowiedź (maksymalnie 3 krótkie punkty).",
    },
  },
  required: ["score", "feedback", "strengths", "gaps", "tips"],
  additionalProperties: false,
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseEvaluation(value: unknown): Evaluation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const { score, feedback, strengths, gaps, tips } = value as Record<string, unknown>;

  if (
    typeof score !== "number" ||
    !Number.isFinite(score) ||
    typeof feedback !== "string" ||
    !isStringArray(strengths) ||
    !isStringArray(gaps) ||
    !isStringArray(tips)
  ) {
    return null;
  }

  return {
    score: Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(score))),
    feedback,
    strengths,
    gaps,
    tips,
  };
}

// What the feedback views show: an evaluation, or a message when there is none.
export type Feedback = Evaluation | string;
