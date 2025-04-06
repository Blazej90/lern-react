"use client";

import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import RecordingTimer from "@/components/recording-timer";
import MicrophoneButton from "@/components/microphone-button";
import ResultList from "@/components/result-list";
import axios from "axios";
import "regenerator-runtime/runtime";
import AIResponse from "@/components/ai-response";
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
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
      setTimeout(() => {
        setIsDrawerOpen(true);
      }, 500);
    }
  };

  useEffect(() => {
    if (!listening && transcript.trim()) {
      const timeSpent = recordingTime;
      const answer = transcript.trim();

      getAIResponse(answer);
      onSave(answer, timeSpent);

      resetTranscript();
    }
  }, [listening]);

  const getAIResponse = async (userInput: string) => {
    if (!userInput.trim()) return;

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
        const key = question || "Nieznane pytanie";
        const storedResponses = JSON.parse(
          localStorage.getItem("aiResponses") || "{}"
        );

        if (!Array.isArray(storedResponses[key])) {
          storedResponses[key] = [];
        }

        storedResponses[key].push(aiAnswer);
        localStorage.setItem("aiResponses", JSON.stringify(storedResponses));
      }
    } catch (error) {
      console.error("Error getting response from OpenAI:", error);
      setFeedback("Przepraszamy, wystąpił błąd przy uzyskiwaniu odpowiedzi.");
    } finally {
      setIsLoading(false);
    }
  };

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
