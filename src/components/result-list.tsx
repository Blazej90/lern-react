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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(!!interimResult);
  }, [interimResult, setIsLoading]);

  const handleShowAIResponse = () => {
    const savedResponse =
      localStorage.getItem("aiResponse") || "Brak odpowiedzi AI.";
    setSelectedResponse(savedResponse);
    setIsDialogOpen(true);
  };

  return (
    <ScrollArea className="w-full max-h-96 overflow-y-auto p-4">
      <ul className="space-y-4">
        {interimResult && (
          <Card className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 shadow-md">
            <CardContent className="text-black dark:text-white">
              {interimResult}
            </CardContent>
          </Card>
        )}

        {results.map((result, index) => (
          <Card
            key={index}
            className="shadow-md bg-white dark:bg-black border border-gray-300 dark:border-gray-700"
          >
            <CardHeader>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                Pytanie: {result.question}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-black dark:text-white">
                Odpowiedź: {result.answer}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Czas odpowiedzi: {formatTime(result.time)}
              </div>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={handleShowAIResponse}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
                  >
                    Odpowiedź AI
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Odpowiedź AI</AlertDialogTitle>
                  </AlertDialogHeader>
                  <ScrollArea className="max-h-60 p-2 border border-gray-300 dark:border-gray-700 rounded-md">
                    <AlertDialogDescription className="text-lg leading-relaxed">
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

              <Button
                onClick={() => onDelete(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg"
              >
                Usuń
              </Button>
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
