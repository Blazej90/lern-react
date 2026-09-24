"use client";

import { useUser } from "@clerk/nextjs";
import "regenerator-runtime/runtime";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import SpeechButton from "@/components/speech-button";
import QuestionPicker from "@/components/question-picker";
import ResultList from "@/components/result-list";
import { removeAIResponses } from "@/lib/ai-responses-storage";

interface Result {
  question: string;
  answer: string;
  time: number;
}

export default function Home() {
  // Access is enforced by middleware; this only avoids rendering before Clerk loads.
  const { isSignedIn } = useUser();

  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  const saveResult = useCallback(
    (question: string, answer: string, time: number) => {
      setResults((prev) => [
        ...prev.filter((r) => r.question !== question),
        { question, answer, time },
      ]);
    },
    [],
  );

  const deleteResult = useCallback((question: string) => {
    removeAIResponses(question);
    setResults((prev) => prev.filter((r) => r.question !== question));
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
        <QuestionPicker
          hidden={currentQuestion !== null}
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
              onSave={saveResult}
            />
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 p-4 rounded-lg">
            <ResultList results={results} onDelete={deleteResult} />
          </div>
        )}
      </div>
    </div>
  );
}
