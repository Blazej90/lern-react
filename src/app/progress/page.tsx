import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreChart from "@/components/score-chart";
import { getProgress } from "@/db/progress";
import { MAX_SCORE } from "@/lib/evaluation";
import {
  formatChange,
  formatScore,
  summarizeProgress,
  topicLabel,
  type ProgressData,
  type TopicStats,
} from "@/lib/progress";

export const metadata = {
  title: "Postępy | Learn React",
};

const headingClass = "text-lg sm:text-xl font-semibold";

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-1">
        <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  );
}

function Change({ value }: { value: number }) {
  const Icon = value < 0 ? TrendingDown : TrendingUp;
  return (
    <span className="inline-flex items-center gap-1">
      {value !== 0 && <Icon aria-hidden className="h-4 w-4" />}
      {formatChange(value)}
    </span>
  );
}

function TopicRow({ topic }: { topic: TopicStats }) {
  const practiced = topic.averageScore !== null;
  return (
    <li className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-medium">{topicLabel(topic.topic)}</span>
        <span className="text-sm text-muted-foreground">
          {practiced ? (
            <>
              <strong className="text-foreground">
                {formatScore(topic.averageScore!)}/{MAX_SCORE}
              </strong>
              {topic.improvement !== null && (
                <>
                  {" "}· zmiana <Change value={topic.improvement} />
                </>
              )}
            </>
          ) : (
            "jeszcze nie ćwiczone"
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted" aria-hidden>
        {practiced && (
          <div
            className="h-2 rounded-full bg-purple-500 dark:bg-purple-400"
            style={{ width: `${(topic.averageScore! / MAX_SCORE) * 100}%` }}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Pytania: {topic.answeredQuestions}/{topic.totalQuestions} · odpowiedzi:{" "}
        {topic.attempts}
      </p>
    </li>
  );
}

function ProgressView({ data }: { data: ProgressData }) {
  const summary = summarizeProgress(data);

  if (summary.attempts === 0) {
    return (
      <Card>
        <CardContent className="p-6 space-y-2">
          <p>Nie masz jeszcze żadnych odpowiedzi.</p>
          <p className="text-muted-foreground">
            Odpowiedz na kilka pytań, a tutaj zobaczysz swoje wyniki i tematy
            do powtórki.{" "}
            <Link href="/" className="underline underline-offset-4">
              Wylosuj pytanie
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  const unansweredByTopic = data.topics
    .map((t) => [t.topic, data.unanswered.filter((q) => q.topic === t.topic)] as const)
    .filter(([, questions]) => questions.length > 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Odpowiedzi" value={String(summary.attempts)} />
        <StatTile
          label="Średnia ocena"
          value={`${formatScore(summary.averageScore!)}/${MAX_SCORE}`}
        />
        <StatTile
          label="Przećwiczone pytania"
          value={`${summary.answeredQuestions}/${summary.totalQuestions}`}
        />
        <StatTile
          label="Trend"
          value={summary.trend ? formatChange(summary.trend.change) : "–"}
          note={
            summary.trend
              ? `Średnia: ostatnie odpowiedzi (${summary.trend.window}) w porównaniu z wcześniejszymi (${summary.trend.window})`
              : "Potrzebne są co najmniej 2 odpowiedzi"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={headingClass}>Wyniki w czasie</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreChart points={data.timeline} />
        </CardContent>
      </Card>

      {(summary.weakestTopics.length > 0 || summary.mostImproved) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {summary.weakestTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className={headingClass}>Do powtórki</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {summary.weakestTopics.map((t) => (
                    <li key={t.topic}>
                      {topicLabel(t.topic)}:{" "}
                      <strong>
                        {formatScore(t.averageScore!)}/{MAX_SCORE}
                      </strong>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {summary.mostImproved && (
            <Card>
              <CardHeader>
                <CardTitle className={headingClass}>Największy postęp</CardTitle>
              </CardHeader>
              <CardContent>
                {topicLabel(summary.mostImproved.topic)}:{" "}
                <strong>
                  <Change value={summary.mostImproved.improvement!} />
                </strong>{" "}
                <span className="text-sm text-muted-foreground">
                  (ostatnie odpowiedzi w porównaniu z pierwszymi)
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className={headingClass}>Tematy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-5">
            {data.topics.map((topic) => (
              <TopicRow key={topic.topic} topic={topic} />
            ))}
          </ul>
        </CardContent>
      </Card>

      {data.unanswered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={headingClass}>
              Pytania bez odpowiedzi ({data.unanswered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unansweredByTopic.map(([topic, questions]) => (
              <div key={topic} className="space-y-1">
                <h3 className="font-medium">{topicLabel(topic)}</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {questions.map((q) => (
                    <li key={q.text}>{q.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default async function ProgressPage() {
  // Access is enforced by middleware.
  const { userId } = await auth();

  let data: ProgressData | null = null;
  if (userId) {
    try {
      data = await getProgress(userId);
    } catch (error) {
      console.error(
        "❌ Błąd podczas pobierania postępów:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Twoje postępy</h1>
        <p className="text-muted-foreground">
          Średnie oceny AI, wyniki w czasie i tematy, które warto powtórzyć.
        </p>
      </div>

      {data ? (
        <ProgressView data={data} />
      ) : (
        <p className="text-red-500">Nie udało się wczytać postępów. Odśwież stronę.</p>
      )}

      <Link href="/" className="inline-block underline underline-offset-4">
        ← Wróć do aplikacji
      </Link>
    </div>
  );
}
