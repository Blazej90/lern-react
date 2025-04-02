"use client";

import React, { useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const AIResponse: React.FC<{
  feedback: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoading: boolean;
}> = ({ feedback, isOpen, setIsOpen, isLoading }) => {
  useEffect(() => {
    if (feedback) {
      localStorage.setItem("aiResponse", feedback);
    }
  }, [feedback]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setIsOpen(false);
      }}
    >
      <DrawerContent
        autoFocus={false}
        className="max-w-4xl mx-auto rounded-t-lg transition-transform duration-900 ease-in-out p-8"
        aria-hidden="false"
      >
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-3xl font-bold">Feedback AI</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 rounded-lg">
          <ScrollArea className="max-h-96 overflow-y-auto p-4 rounded-lg">
            {isLoading || feedback === null ? (
              <div className="flex items-center justify-center gap-3 text-xl font-medium text-gray-800 dark:text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="animate-pulse">
                  AI is typing<span className="animate-bounce">...</span>
                </span>
              </div>
            ) : feedback.trim() ? (
              <p className="text-xl leading-relaxed">{feedback}</p>
            ) : (
              <p className="text-xl leading-relaxed">Brak odpowiedzi od AI.</p>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Zamknij
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AIResponse;
