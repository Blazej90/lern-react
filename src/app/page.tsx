"use client";

import { useUser } from "@clerk/nextjs";
import "regenerator-runtime/runtime";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import SpeechButton from "@/components/speech-button";
import QuestionPicker from "@/components/question-picker";
import ResultList from "@/components/result-list";
import DemoBanner from "@/components/demo-banner";
import type { Attempt } from "@/lib/attempts";
import { demoBlockReason, type DemoStatus } from "@/lib/demo";

export default function Home() {
  // Access is enforced by middleware; this only avoids rendering before Clerk loads.
  const { isSignedIn } = useUser();

  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  // Newest first, as returned by /api/attempts.
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  // null until loaded; the server enforces the limit either way.
  const [demo, setDemo] = useState<DemoStatus | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    let cancelled = false;
    axios
      .get<{ demo: DemoStatus }>("/api/demo")
      .then((res) => {
        if (!cancelled) setDemo(res.data.demo);
      })
      .catch((error) => console.error("Error loading demo status:", error));

    axios
      .get<{ attempts: Attempt[] }>("/api/attempts")
      .then((res) => {
        if (!cancelled) setAttempts(res.data.attempts);
      })
      .catch((error) => {
        console.error("Error loading history:", error);
        if (!cancelled) setHistoryError("Nie udało się wczytać historii odpowiedzi.");
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const addAttempt = useCallback((attempt: Attempt) => {
    setAttempts((prev) => [attempt, ...prev]);
  }, []);

  const deleteQuestion = useCallback(async (question: string) => {
    try {
      await axios.delete("/api/attempts", { data: { question } });
      setHistoryError(null);
      setAttempts((prev) => prev.filter((a) => a.question !== question));
    } catch (error) {
      console.error("Error deleting attempts:", error);
      setHistoryError("Nie udało się usunąć odpowiedzi. Spróbuj ponownie.");
    }
  }, []);

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="relative w-full max-w-4xl">
        <Image
          src="/ai-learning-bg.webp"
          alt=""
          width={1600}
          height={150}
          className="w-full h-auto mx-auto rounded-lg shadow-lg object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] rounded-lg"></div>
        <h1 className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white drop-shadow-2xl rounded-lg p-6">
          Ucz się React.js z AI
        </h1>
      </div>

      <div className="max-w-4xl w-full p-4 sm:p-6 md:p-8 rounded-lg">
        {demo && <DemoBanner demo={demo} />}

        <QuestionPicker
          hidden={currentQuestion !== null}
          disabled={demo !== null && demoBlockReason(demo) !== null}
          onPick={setCurrentQuestion}
        />

        {currentQuestion && (
          <div className="mt-6 p-4 rounded-lg">
            <h2 className="text-base sm:text-lg md:text-xl mb-4 text-center">
              Pytanie: {currentQuestion}
            </h2>
            <SpeechButton
              question={currentQuestion}
              onClose={() => setCurrentQuestion(null)}
              onSaved={addAttempt}
              onDemoChange={setDemo}
            />
          </div>
        )}

        {historyError && (
          <p className="mt-6 text-center text-sm text-red-500">{historyError}</p>
        )}

        {attempts.length > 0 && (
          <div className="mt-6 p-4 rounded-lg">
            <p className="text-center text-sm sm:text-base">
              <Link href="/progress" className="underline underline-offset-4">
                Zobacz swoje postępy →
              </Link>
            </p>
            <ResultList attempts={attempts} onDelete={deleteQuestion} />
          </div>
        )}
      </div>
    </div>
  );
}
