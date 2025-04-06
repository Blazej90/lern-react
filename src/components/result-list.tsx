"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { HelpCircle, MessageSquare } from "lucide-react";

interface Results {
  question: string;
  answer: string;
  time: number;
}

interface ResultListProps {
  results: Results[];
  interimResult: string | null;
  setIsLoading: (loading: boolean) => void;
  onDelete?: (index: number) => void;
}

const ResultList: React.FC<ResultListProps> = ({
  results,
  interimResult,
  setIsLoading,
  onDelete,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(!!interimResult);
  }, [interimResult, setIsLoading]);

  const handleShowAIResponse = (question: string) => {
    const storedResponses = JSON.parse(
      localStorage.getItem("aiResponses") || "{}"
    );

    const responses = storedResponses[question];
    if (Array.isArray(responses) && responses.length > 0) {
      const formatted = responses
        .map((res: string, i: number) => `Wersja ${i + 1}:\n${res}`)
        .join("\n\n---\n\n");
      setSelectedResponse(formatted);
    } else {
      setSelectedResponse("Brak odpowiedzi AI.");
    }
    setIsDialogOpen(true);
  };

  return (
    <ScrollArea className="w-full max-h-96 overflow-y-auto p-4 sm:p-6">
      <ul className="space-y-4">
        {interimResult && (
          <Card className="bg-muted border border-gray-300 dark:border-gray-700 shadow-md rounded-xl">
            <CardContent className="text-foreground">
              {interimResult}
            </CardContent>
          </Card>
        )}

        {results.map((result, index) => (
          <Card
            key={index}
            className="shadow-md border-l-4 border-purple-500 bg-muted dark:bg-muted/40 rounded-xl"
          >
            <CardHeader>
              <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-purple-600 dark:text-purple-400">
                <HelpCircle className="w-5 h-5" />
                Pytanie: {result.question}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-start gap-2 text-sm sm:text-base text-foreground mt-2">
                <MessageSquare className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
                <p>{result.answer}</p>
              </div>

              <div className="text-xs sm:text-sm text-muted-foreground mt-3">
                Czas odpowiedzi: {formatTime(result.time)}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={() => handleShowAIResponse(result.question)}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 text-sm sm:text-base"
                  >
                    Odpowiedź AI
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-full max-w-sm sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Odpowiedź AI</AlertDialogTitle>
                  </AlertDialogHeader>
                  <ScrollArea className="max-h-60 p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded-md">
                    <AlertDialogDescription className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                      {selectedResponse}
                    </AlertDialogDescription>
                  </ScrollArea>
                  <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
                      OK
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {onDelete && (
                <Button
                  onClick={() => onDelete(index)}
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
                >
                  Usuń
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
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
