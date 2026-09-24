"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Bot } from "lucide-react";

const AIResponse: React.FC<{
  feedback: string | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}> = ({ feedback, isOpen, onClose, isLoading }) => {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent
        autoFocus={false}
        className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto rounded-t-lg transition-transform duration-700 ease-in-out p-4 sm:p-6"
      >
        <DrawerHeader className="text-center">
          <DrawerTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
            <Bot className="w-6 h-6" />
            Ocena AI
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-2 sm:p-4 rounded-lg">
          <ScrollArea className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto rounded-lg">
            {isLoading || feedback === null ? (
              <div className="flex items-center justify-center gap-3 text-base sm:text-lg font-medium text-gray-800 dark:text-white animate-in fade-in duration-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="animate-pulse">
                  AI analizuje odpowiedź<span className="animate-bounce">...</span>
                </span>
              </div>
            ) : feedback.trim() ? (
              <div className="text-base sm:text-lg whitespace-pre-wrap leading-relaxed animate-in fade-in duration-500">
                {feedback}
              </div>
            ) : (
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Brak odpowiedzi od AI.
              </p>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-center mt-4 sm:mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-sm sm:text-base px-6 py-2"
          >
            Zamknij
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AIResponse;
