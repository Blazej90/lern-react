"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const QuestionPicker: React.FC<{
  onQuestionChange: (question: string) => void;
}> = ({ onQuestionChange }) => {
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
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    onQuestionChange(question);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Button onClick={getRandomQuestion}>Losuj pytanie</Button>
    </div>
  );
};

export default QuestionPicker;
