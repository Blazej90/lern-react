"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { REACT_QUESTIONS } from "@/data/react-questions";

interface QuestionPickerProps {
  onQuestionChange: (question: string) => void;
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>;
  isRecording: boolean;
  currentQuestion: string | null;
}

const QuestionPicker: React.FC<QuestionPickerProps> = ({
  onQuestionChange,
  setRecordingTime,
  isRecording,
  currentQuestion,
}) => {
  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * REACT_QUESTIONS.length);
    const question = REACT_QUESTIONS[randomIndex];
    onQuestionChange(question);
    setRecordingTime(0);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full">
      {!isRecording && !currentQuestion && (
        <Button
          onClick={getRandomQuestion}
          className="flex items-center justify-center gap-2 text-base sm:text-lg md:text-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md transition duration-300 transform hover:scale-105 active:scale-95 w-full max-w-xs"
        >
          <Shuffle className="w-5 h-5" />
          Losuj pytanie React
        </Button>
      )}
    </div>
  );
};

export default QuestionPicker;
