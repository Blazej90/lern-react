"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface QuestionPickerProps {
  onQuestionChange: (question: string) => void;
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>;
  isRecording: boolean;
  currentQuestion: string | null;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const QuestionPicker: React.FC<QuestionPickerProps> = ({
  onQuestionChange,
  setRecordingTime,
  isRecording,
  currentQuestion,
  setIsDrawerOpen,
}) => {
  const questions = [
    "Jak działa useState i kiedy go używamy?",
    "Co to jest virtual DOM i dlaczego jest używany w React?",
    "Jak przekazywać dane między komponentami za pomocą props?",
    "Jak działa mechanizm kluczy (keys) w React i dlaczego są ważne?",
    "Co to jest i jak działa useEffect w React?",
    "Jak zarządzać stanem aplikacji w React za pomocą useReducer?",
    "Czym są i do czego służą hooks w React?",
    "Jak działa kontekst (Context) w React i kiedy go używać?",
    "Co to jest i jak działa useContext w React?",
    "Czym różnią się komponenty klasowe od komponentów funkcyjnych w React?",
    "Co to jest JSX i jak działa w React?",
    "Jak działają renderowanie warunkowe i lista w React?",
    "Czym jest i jak działa React Router?",
    "Co to jest i jak używać React.memo?",
    "Co to jest i jak działa useRef w React?",
    "Czym jest i jak działa Fragment w React?",
    "Co to jest i jak działa lazy loading w React?",
    "Jakie są różnice między uncontrolled a controlled components w React?",
    "Co to jest Redux i jak z niego korzystać w aplikacjach React?",
    "Jak działa optymalizacja wydajności w React, np. PureComponent?",
    "Co to jest useCallback i jak pomaga w optymalizacji aplikacji React?",
    "Jak obsługiwać formularze w React?",
    "Co to jest React DevTools i jak go używać do debugowania aplikacji?",
    "Czym są HOC (Higher Order Components) i jak je używać w React?",
    "Jakie są zasady dotyczące cyklu życia komponentu w React?",
    "Co to jest i jak działa Suspense w React?",
    "Jakie są zalety stosowania TypeScript z React?",
    "Czym jest i jak używać prop-types w React?",
  ];

  const getRandomQuestion = () => {
    setIsDrawerOpen(false);

    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    onQuestionChange(question);

    setRecordingTime(0);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {!isRecording && !currentQuestion && (
        <Button
          onClick={getRandomQuestion}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
        >
          Losuj pytanie
        </Button>
      )}
    </div>
  );
};

export default QuestionPicker;
