"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { REACT_QUESTIONS } from "@/data/react-questions";

interface QuestionPickerProps {
  hidden: boolean;
  onPick: (question: string) => void;
}

// Stays mounted while hidden so the last question survives between picks.
const QuestionPicker: React.FC<QuestionPickerProps> = ({ hidden, onPick }) => {
  const lastQuestion = useRef<string | null>(null);

  const pickRandomQuestion = () => {
    const candidates = REACT_QUESTIONS.filter(
      (q) => q !== lastQuestion.current,
    );
    const question = candidates[Math.floor(Math.random() * candidates.length)];
    lastQuestion.current = question;
    onPick(question);
  };

  if (hidden) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full">
      <Button
        onClick={pickRandomQuestion}
        className="flex items-center justify-center gap-2 text-base sm:text-lg md:text-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md transition duration-300 transform hover:scale-105 active:scale-95 w-full max-w-xs"
      >
        <Shuffle className="w-5 h-5" />
        Losuj pytanie React
      </Button>
    </div>
  );
};

export default QuestionPicker;
