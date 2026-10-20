import React from "react";
import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { MAX_SCORE, type Evaluation } from "@/lib/evaluation";
import type { StoredAIResponse } from "@/lib/ai-responses-storage";
import { cn } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 7) return "bg-green-500/15 text-green-700 dark:text-green-400";
  if (score >= 4) return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400";
}

const EvaluationSection: React.FC<{
  title: string;
  items: string[];
  icon: React.ReactNode;
}> = ({ title, items, icon }) => {
  if (items.length === 0) return null;

  return (
    <section>
      <h3 className="flex items-center gap-2 font-semibold mb-1">
        {icon}
        {title}
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
};

const StructuredEvaluation: React.FC<{ evaluation: Evaluation }> = ({
  evaluation,
}) => (
  <div className="space-y-4">
    <div
      className={cn(
        "inline-flex items-baseline gap-1 rounded-full px-4 py-1 font-bold",
        scoreColor(evaluation.score),
      )}
    >
      <span className="text-2xl">{evaluation.score}</span>
      <span className="text-sm">/ {MAX_SCORE}</span>
    </div>

    <p className="leading-relaxed">{evaluation.feedback}</p>

    <EvaluationSection
      title="Co było dobrze"
      items={evaluation.strengths}
      icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
    />
    <EvaluationSection
      title="Czego zabrakło"
      items={evaluation.gaps}
      icon={<XCircle className="w-5 h-5 text-red-600" />}
    />
    <EvaluationSection
      title="Wskazówki"
      items={evaluation.tips}
      icon={<Lightbulb className="w-5 h-5 text-yellow-600" />}
    />
  </div>
);

const EvaluationView: React.FC<{ response: StoredAIResponse }> = ({
  response,
}) =>
  typeof response === "string" ? (
    <div className="whitespace-pre-wrap leading-relaxed">{response}</div>
  ) : (
    <StructuredEvaluation evaluation={response} />
  );

export default EvaluationView;
