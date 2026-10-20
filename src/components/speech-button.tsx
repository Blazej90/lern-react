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
import { addAIResponse, type StoredAIResponse } from "@/lib/ai-responses-storage";
import { parseEvaluation } from "@/lib/evaluation";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const SPEECH_ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "Brak dostępu do mikrofonu. Zezwól na mikrofon w ustawieniach strony (ikona kłódki przy adresie) i spróbuj ponownie.",
  "service-not-allowed":
    "Przeglądarka zablokowała usługę rozpoznawania mowy. Użyj Chrome lub Edge.",
  "audio-capture":
    "Nie wykryto mikrofonu. Sprawdź, czy jest podłączony i wybrany w ustawieniach systemu.",
  network:
    "Błąd sieci podczas rozpoznawania mowy. Sprawdź połączenie z internetem. Jeśli używasz Brave lub Opery, spróbuj w Chrome lub Edge.",
  "no-speech": "Nie wykryto mowy. Mów bliżej mikrofonu i spróbuj ponownie.",
  "language-not-supported":
    "Przeglądarka nie obsługuje rozpoznawania mowy w języku polskim.",
};

const DEFAULT_SPEECH_ERROR = "Wystąpił błąd rozpoznawania mowy.";
const EMPTY_TRANSCRIPT_MESSAGE =
  "Nie rozpoznano żadnej wypowiedzi. Sprawdź mikrofon i spróbuj ponownie.";

interface SpeechButtonProps {
  question: string;
  onClose: () => void;
  onSave: (question: string, answer: string, time: number) => void;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({
  question,
  onClose,
  onSave,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<StoredAIResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  // Set by the recognition `error` event, which fires before `end`.
  const speechErrorRef = useRef<string | null>(null);

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

  // react-speech-recognition swallows recognition errors, so listen on the
  // native instance directly to tell the user why no text appeared.
  useEffect(() => {
    const recognition = SpeechRecognition.getRecognition();
    if (!recognition) return;

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      const message =
        SPEECH_ERROR_MESSAGES[event.error] ?? DEFAULT_SPEECH_ERROR;
      speechErrorRef.current = message;
      setSpeechError(message);
    };

    recognition.addEventListener("error", handleError);
    return () => recognition.removeEventListener("error", handleError);
  }, []);

  useEffect(() => {
    if (!listening) return;
    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [listening]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [transcript]);

  const handleStartListening = () => {
    resetTranscript();
    setRecordingTime(0);
    speechErrorRef.current = null;
    setSpeechError(null);
    SpeechRecognition.startListening({ continuous: true, language: "pl-PL" });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  const getAIResponse = useCallback(
    async (userInput: string) => {
      setFeedback(null);
      setIsDrawerOpen(true);
      setIsLoading(true);

      try {
        const response = await axios.post("/api/openai", {
          userAnswer: userInput,
          question,
        });

        const evaluation = parseEvaluation(response.data?.evaluation);

        if (evaluation) {
          setFeedback(evaluation);
          addAIResponse(question, evaluation);
        } else {
          setFeedback("Brak odpowiedzi od AI.");
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
    if (!answer) {
      if (!speechErrorRef.current) setSpeechError(EMPTY_TRANSCRIPT_MESSAGE);
      return;
    }

    getAIResponse(answer);
    onSave(question, answer, recordingTime);
    resetTranscript();
  }, [
    question,
    transcript,
    recordingTime,
    getAIResponse,
    onSave,
    resetTranscript,
  ]);

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
          onStart={handleStartListening}
          onStop={handleStopListening}
        />

        {speechError && (
          <p
            role="alert"
            className="w-full text-sm sm:text-base text-red-500 text-center"
          >
            {speechError}
          </p>
        )}

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
          onClose={() => {
            setIsDrawerOpen(false);
            onClose();
          }}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default SpeechButton;
