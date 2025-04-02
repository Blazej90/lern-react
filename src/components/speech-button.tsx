import React, { useEffect, useState } from "react";
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
  const [results, setResults] = useState<
    { question: string; answer: string; time: number }[]
  >([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setIsRecording(listening);
  }, [listening, setIsRecording]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (listening) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [listening, setRecordingTime]);

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
      const newResult = {
        question: question || "Nieznane pytanie",
        answer: transcript.trim(),
        time: timeSpent,
      };
      resetTranscript();
      getAIResponse(transcript);
      onSave(transcript.trim(), timeSpent);
    }
  }, [listening, transcript, resetTranscript, recordingTime, question, onSave]);

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
        Your browser does not support speech recognition.
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center space-y-6 p-6">
        <RecordingTimer isRecording={listening} recordingTime={recordingTime} />
        <MicrophoneButton
          isRecording={listening}
          onClick={listening ? handleStopListening : handleStartListening}
          onStop={handleStopListening}
        />

        <Textarea
          className="w-full p-3 border rounded-lg text-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          value={transcript}
          readOnly
          placeholder="Twoja odpowiedź pojawi się tutaj..."
        />

        {results.length > 0 && (
          <ResultList
            results={results}
            interimResult={listening ? transcript : null}
            setIsLoading={setIsLoading}
          />
        )}

        <AIResponse
          feedback={feedback}
          isOpen={isDrawerOpen}
          setIsOpen={(open) => {
            setIsDrawerOpen(open);
            if (!open) {
              setCurrentQuestion(null);
            }
          }}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default SpeechButton;
