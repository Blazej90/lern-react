"use client";

import { useUser } from "@clerk/nextjs";
import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SpeechButton from "@/components/speech-button";
import Questions from "@/components/questions-react";
import ResultList from "@/components/result-list";

interface Result {
  question: string;
  answer: string;
  time: number;
}

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [results, setResults] = useState<Result[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded) {
      setMounted(true);
    }
  }, [isLoaded]);

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
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
        <h1 className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-center text-white drop-shadow-2xl rounded-lg p-6">
          Ucz się React.js z AI
        </h1>
      </div>

      <div className="max-w-4xl w-full p-8 rounded-lg">
        <Questions
          onQuestionChange={setCurrentQuestion}
          setRecordingTime={setRecordingTime}
          isRecording={isRecording}
          currentQuestion={currentQuestion}
        />

        {currentQuestion && (
          <div className="mt-6 p-4 rounded-lg">
            <h3 className="text-xl mb-4">Pytanie: {currentQuestion}</h3>
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
              interimResult={null}
              setIsLoading={() => {}}
              onDelete={(index) =>
                setResults(results.filter((_, i) => i !== index))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
