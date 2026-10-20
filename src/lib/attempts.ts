import type { Evaluation } from "@/lib/evaluation";

// An answered question as the API returns it to the client.
export interface Attempt {
  id: string;
  question: string;
  transcript: string;
  durationSeconds: number;
  createdAt: string;
  evaluation: Evaluation;
}
