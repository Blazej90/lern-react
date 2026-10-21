"use client";

import React, { useState } from "react";
import { MAX_SCORE } from "@/lib/evaluation";
import { topicLabel, type TimelinePoint } from "@/lib/progress";

interface ScoreChartProps {
  // Oldest first.
  points: TimelinePoint[];
}

// A fixed time zone, so the server and the browser render the same labels.
const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Warsaw",
});

const GRID_SCORES = [0, 5, 10];

// Positions in percent of the plot area; the line is drawn in a stretched SVG
// and the dots are HTML, so they stay round at any width.
function position(index: number, count: number, score: number) {
  return {
    x: count === 1 ? 50 : (index / (count - 1)) * 100,
    y: 100 - (score / MAX_SCORE) * 100,
  };
}

const ScoreChart: React.FC<ScoreChartProps> = ({ points }) => {
  const [active, setActive] = useState<number | null>(null);
  const positions = points.map((p, i) => position(i, points.length, p.score));
  const activePoint = active !== null ? points[active] : null;

  return (
    <figure className="space-y-2">
      <div className="flex gap-2">
        <div
          aria-hidden
          className="relative w-6 shrink-0 text-right text-xs text-muted-foreground"
        >
          {GRID_SCORES.map((score) => (
            <span
              key={score}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${100 - (score / MAX_SCORE) * 100}%` }}
            >
              {score}
            </span>
          ))}
        </div>

        <div className="relative h-48 flex-1" onMouseLeave={() => setActive(null)}>
          {GRID_SCORES.map((score) => (
            <div
              key={score}
              aria-hidden
              className="absolute inset-x-0 border-t border-border"
              style={{ top: `${100 - (score / MAX_SCORE) * 100}%` }}
            />
          ))}

          {active !== null && (
            <div
              aria-hidden
              className="absolute inset-y-0 border-l border-muted-foreground/40"
              style={{ left: `${positions[active].x}%` }}
            />
          )}

          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full overflow-visible text-purple-500 dark:text-purple-400"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {positions.length > 1 && (
              <>
                <polygon
                  points={`0,100 ${positions.map((p) => `${p.x},${p.y}`).join(" ")} 100,100`}
                  className="fill-current opacity-10"
                />
                <polyline
                  points={positions.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>

          {points.map((point, i) => (
            <button
              key={`${point.createdAt}-${i}`}
              type="button"
              className="group absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }}
              aria-label={`${dateFormat.format(new Date(point.createdAt))}: ocena ${point.score}/${MAX_SCORE}, ${point.question}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
            >
              <span
                className={`block rounded-full bg-purple-500 ring-2 ring-background dark:bg-purple-400 ${active === i ? "h-3 w-3" : "h-2 w-2"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <figcaption className="ml-8 min-h-10 text-xs sm:text-sm text-muted-foreground">
        {activePoint ? (
          <span>
            <strong className="text-foreground">
              {activePoint.score}/{MAX_SCORE}
            </strong>{" "}
            · {dateFormat.format(new Date(activePoint.createdAt))} ·{" "}
            {topicLabel(activePoint.topic)} · {activePoint.question}
          </span>
        ) : (
          <span>
            Wyniki ostatnich odpowiedzi ({points.length}), od najstarszej.
            Najedź na punkt albo go dotknij, żeby zobaczyć szczegóły.
          </span>
        )}
      </figcaption>
    </figure>
  );
};

export default ScoreChart;
