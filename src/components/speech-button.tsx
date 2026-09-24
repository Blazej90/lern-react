"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import RecordingTimer from "@/components/recording-timer";
import MicrophoneButton from "@/components/microphone-button";
import axios from "axios";
import "regenerator-runtime/runtime";
import AIResponse from "@/components/ai-response";
import { addAIResponse } from "@/lib/ai-responses-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface SpeechButtonProps {
  question: string | null;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<string | null>>;
  recordingTime: number;
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: (answer: string, time: number) => void;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({
  question,
  setCurrentQuestion,
  recordingTime,
  setRecordingTime,
  setIsRecording,
  onSave,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsRecording(listening);
  }, [listening, setIsRecording]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (listening) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [listening, setRecordingTime]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [transcript]);

  const handleStartListening = () => {
    resetTranscript();
    setRecordingTime(0);
    SpeechRecognition.startListening({ continuous: true, language: "pl-PL" });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  const getAIResponse = useCallback(
    async (userInput: string) => {
      if (!question) return;

      setFeedback(null);
      setIsDrawerOpen(true);
      setIsLoading(true);

      try {
        const response = await axios.post("/api/openai", {
          userAnswer: userInput,
          question,
        });

        const raw = response.data.aiAnswer;
        const aiAnswer = raw && raw.trim().length > 0 ? raw : null;

        setFeedback(aiAnswer);

        if (aiAnswer) {
          addAIResponse(question, aiAnswer);
        }
      } catch (error) {
        console.error("Error getting response from OpenAI:", error);
        const serverError = axios.isAxiosError(error)
          ? error.response?.data?.error
          : null;
        setFeedback(
          typeof serverError === "string"
            ? serverError
            : "Przepraszamy, wystąpił błąd przy uzyskiwaniu odpowiedzi.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [question],
  );

  const submitAnswer = useCallback(() => {
    const answer = transcript.trim();
    if (!answer) return;

    getAIResponse(answer);
    onSave(answer, recordingTime);
    resetTranscript();
  }, [transcript, recordingTime, getAIResponse, onSave, resetTranscript]);

  // Submit once when recording ends — whether the user pressed stop or the
  // browser ended recognition on its own. The final transcript is only
  // available after `listening` flips to false.
  const wasListening = useRef(false);
  useEffect(() => {
    if (wasListening.current && !listening) {
      submitAnswer();
    }
    wasListening.current = listening;
  }, [listening, submitAnswer]);

  if (!isClient) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <p className="text-red-500 text-center">
        Twoja przeglądarka nie obsługuje rozpoznawania mowy.
      </p>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6 p-4 sm:p-6">
        <RecordingTimer isRecording={listening} recordingTime={recordingTime} />

        <MicrophoneButton
          isRecording={listening}
          onClick={listening ? handleStopListening : handleStartListening}
          onStop={handleStopListening}
        />

        <Textarea
          ref={textareaRef}
          className="w-full p-3 border rounded-lg text-base sm:text-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white resize-none overflow-hidden min-h-[80px] shadow-inner focus:outline-none"
          value={transcript}
          readOnly
          placeholder="Twoja odpowiedź pojawi się tutaj..."
        />

        <AIResponse
          feedback={feedback}
          isOpen={isDrawerOpen}
          setIsOpen={(open) => {
            setIsDrawerOpen(open);
            if (!open) setCurrentQuestion(null);
          }}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default SpeechButton;
