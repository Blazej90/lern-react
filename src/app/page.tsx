"use client";

import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import SpeechButton from "@/components/SpeechButton";
import Questions from "@/components/Questions";
import { useTheme } from "next-themes";

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-lg">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Ucz się React.js z AI
      </h1>

      <Questions
        onQuestionChange={setCurrentQuestion}
        setRecordingTime={setRecordingTime}
      />

      {currentQuestion && (
        <div className="mt-6 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Pytanie: {currentQuestion}</h3>
          <SpeechButton
            question={currentQuestion}
            recordingTime={recordingTime}
            setRecordingTime={setRecordingTime}
          />
        </div>
      )}
    </div>
  );
}
