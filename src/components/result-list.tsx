import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Results {
  question: string;
  answer: string;
  time: number;
}

const ResultList: React.FC<{
  results: Results[];
  interimResult: string | null;
  setIsLoading: (loading: boolean) => void;
  onDelete: (index: number) => void;
}> = ({ results, interimResult, setIsLoading, onDelete }) => {
  React.useEffect(() => {
    setIsLoading(!!interimResult);
  }, [interimResult, setIsLoading]);

  return (
    <ScrollArea className="w-full max-h-96 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-md">
      <ul className="space-y-4">
        {results.map((result, index) => (
          <li
            key={index}
            className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800"
          >
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              Pytanie: {result.question}
            </div>
            <div className="text-black dark:text-white mt-2">
              Odpowiedź: {result.answer}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Czas odpowiedzi: {formatTime(result.time)}
            </div>
            <Button
              onClick={() => onDelete(index)}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg"
            >
              Usuń
            </Button>
          </li>
        ))}
        {interimResult && (
          <li className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800">
            <div className="text-black dark:text-white">{interimResult}</div>
          </li>
        )}
      </ul>
    </ScrollArea>
  );
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default ResultList;
