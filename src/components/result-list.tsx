"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { HelpCircle, MessageSquare, Bot } from "lucide-react";
import { formatTime } from "@/lib/utils";
import {
  getAIResponses,
  type StoredAIResponse,
} from "@/lib/ai-responses-storage";
import EvaluationView from "@/components/evaluation-view";

interface Result {
  question: string;
  answer: string;
  time: number;
}

interface ResultListProps {
  results: Result[];
  onDelete?: (question: string) => void;
}

const ResultList: React.FC<ResultListProps> = ({ results, onDelete }) => {
  const [selectedResponses, setSelectedResponses] = useState<
    StoredAIResponse[] | null
  >(null);

  const handleShowAIResponse = (question: string) => {
    setSelectedResponses(getAIResponses(question));
  };

  return (
    <>
      <ScrollArea className="w-full max-h-96 overflow-y-auto p-4 sm:p-6">
        <ul className="space-y-4">
          {results.map((result) => (
            <li key={result.question}>
              <Card className="shadow-md border-l-4 border-purple-500 bg-muted dark:bg-muted/40 rounded-xl">
                <CardHeader>
                  <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-purple-600 dark:text-purple-400">
                    <HelpCircle className="w-6 h-6 sm:w-5 sm:h-5" />
                    <span className="flex-1 break-words">
                      Pytanie: {result.question}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-start gap-3 text-sm sm:text-base text-foreground mt-2">
                    <MessageSquare className="w-6 h-6 text-muted-foreground mt-1 shrink-0 sm:mt-0.5" />
                    <p className="leading-relaxed">{result.answer}</p>
                  </div>

                  <div className="text-xs sm:text-sm text-muted-foreground mt-3">
                    Czas odpowiedzi: {formatTime(result.time)}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                  <Button
                    onClick={() => handleShowAIResponse(result.question)}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 text-sm sm:text-base"
                  >
                    Odpowiedź AI
                  </Button>

                  {onDelete && (
                    <Button
                      onClick={() => onDelete(result.question)}
                      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
                    >
                      Usuń
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <Dialog
        open={selectedResponses !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedResponses(null);
        }}
      >
        <DialogContent className="w-full max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Bot className="w-5 h-5 text-purple-500" />
              Odpowiedź AI
            </DialogTitle>
            <DialogDescription className="sr-only">
              Zapisane oceny AI dla tego pytania
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded-md">
            <div className="text-sm sm:text-base">
              {selectedResponses && selectedResponses.length > 0 ? (
                selectedResponses.map((response, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-300 dark:border-gray-700 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
                  >
                    <p className="font-semibold mb-2">Wersja {i + 1}</p>
                    <EvaluationView response={response} />
                  </div>
                ))
              ) : (
                <p className="leading-relaxed">Brak odpowiedzi AI.</p>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-md transition">
                Zamknij
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResultList;
