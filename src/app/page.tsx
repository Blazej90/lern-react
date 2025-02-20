"use client";

import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import SpeechButton from "@/components/speech-button";
import Questions from "@/components/questions-react";
import Image from "next/image";

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
        />

        {currentQuestion && (
          <div className="mt-6 p-4 rounded-lg">
            <h3 className="text-xl mb-4">Pytanie: {currentQuestion}</h3>
            <SpeechButton
              question={currentQuestion}
              recordingTime={recordingTime}
              setRecordingTime={setRecordingTime}
              setIsRecording={setIsRecording}
            />
          </div>
        )}
      </div>
    </div>
  );
}
