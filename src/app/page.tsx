"use client";

import React, { useState, useEffect } from "react";
import SpeechButton from "@/components/SpeechButton";
import Questions from "@/components/Questions";
import { useTheme } from "next-themes";

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={`max-w-4xl mx-auto p-8 rounded-lg shadow-lg ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <h1 className="text-3xl font-semibold text-center mb-6">
        Ucz się React.js z AI
      </h1>

      <Questions onQuestionChange={setCurrentQuestion} />
      {currentQuestion && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl mb-4">Pytanie: {currentQuestion}</h3>
          <SpeechButton question={currentQuestion} />
        </div>
      )}
    </div>
  );
}
