"use client";

import React from "react";
import { Info } from "lucide-react";
import { demoBlockReason, formatQuestionCount, type DemoStatus } from "@/lib/demo";

const DemoBanner: React.FC<{ demo: DemoStatus }> = ({ demo }) => {
  if (demo.mode !== "demo") return null;

  const blockReason = demoBlockReason(demo);

  return (
    <div
      role="status"
      className="mt-6 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm sm:text-base text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="space-y-1">
        <p className="font-semibold">Wersja demonstracyjna</p>
        {demo.limit > 0 && (
          <p>
            Aplikacja korzysta z płatnego API OpenAI, dlatego w wersji demo
            możesz odpowiedzieć na {formatQuestionCount(demo.limit)}.
            Pozostało: <strong>{demo.remaining} z {demo.limit}</strong>.
          </p>
        )}
        {blockReason && <p className="font-medium">{blockReason}</p>}
      </div>
    </div>
  );
};

export default DemoBanner;
