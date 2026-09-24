"use client";

import { useUser } from "@clerk/nextjs";
import "regenerator-runtime/runtime";
import React, { useState } from "react";
import Image from "next/image";
import SpeechButton from "@/components/speech-button";
import Questions from "@/components/questions-react";
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
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [results, setResults] = useState<Result[]>([]);

  if (!isSignedIn) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[28rem] h-[28rem] bg-purple-400/30 dark:bg-purple-500/40 rounded-full blur-3xl animate-blob z-[-1]" />
      <div className="absolute top-[15%] right-[-20%] w-[30rem] h-[30rem] bg-blue-300/30 dark:bg-blue-500/40 rounded-full blur-3xl animate-blob animation-delay-2000 z-[-1]" />
      <div className="absolute bottom-[-10%] left-[30%] w-[34rem] h-[34rem] bg-pink-300/20 dark:bg-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-4000 z-[-1]" />
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-indigo-300/20 dark:bg-indigo-500/30 rounded-full blur-[150px] animate-blob animation-delay-1000 z-[-1]" />

      <div className="relative w-full max-w-4xl">
        <Image
          src="/ai-learning-bg.webp"
          alt="AI Learning"
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
        <Questions
          onQuestionChange={setCurrentQuestion}
          setRecordingTime={setRecordingTime}
          isRecording={isRecording}
          currentQuestion={currentQuestion}
        />

        {currentQuestion && (
          <div className="mt-6 p-4 rounded-lg">
            <h3 className="text-base sm:text-lg md:text-xl mb-4 text-center">
              Pytanie: {currentQuestion}
            </h3>
            <SpeechButton
              question={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              recordingTime={recordingTime}
              setRecordingTime={setRecordingTime}
              setIsRecording={setIsRecording}
              onSave={(answer, time) =>
                setResults((prev) => {
                  const question = currentQuestion ?? "Brak pytania";
                  const withoutDuplicate = prev.filter(
                    (r) => r.question !== question
                  );
                  return [...withoutDuplicate, { question, answer, time }];
                })
              }
            />
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 p-4 rounded-lg">
            <ResultList
              results={results}
              onDelete={(question) => {
                removeAIResponses(question);
                setResults((prev) =>
                  prev.filter((r) => r.question !== question),
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
