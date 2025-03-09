import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import ClearButton from "@/components/clear-button";
import RecordingTimer from "@/components/recording-timer";
import MicrophoneButton from "@/components/microphone-button";
import ResultList from "@/components/result-list";
import axios from "axios";
import "regenerator-runtime/runtime";
import AIResponse from "@/components/ai-response";
import { Card, CardContent } from "@/components/ui/card";

interface SpeechButtonProps {
  question: string;
  recordingTime: number;
  setRecordingTime: React.Dispatch<React.SetStateAction<number>>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: (answer: string, time: number) => void;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({
  question,
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    if (!listening && transcript.trim()) {
      const timeSpent = recordingTime;
      const newResult = {
        question,
        answer: transcript.trim(),
        time: timeSpent,
      };

      setResults((prevResults) => [newResult, ...prevResults]);
      resetTranscript();
      getAIResponse(transcript);
      onSave(transcript.trim(), timeSpent);
    }
  }, [listening, transcript, resetTranscript, recordingTime, question, onSave]);

  const getAIResponse = async (userInput: string) => {
    if (!userInput.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.post("/api/openai", {
        userAnswer: userInput,
        question,
      });
      const aiAnswer = response.data.aiAnswer || "Brak odpowiedzi AI.";

      setFeedback(aiAnswer);
      setIsDrawerOpen(true);

      const storedResponses = JSON.parse(
        localStorage.getItem("aiResponses") || "{}"
      );
      storedResponses[question] = aiAnswer;
      localStorage.setItem("aiResponses", JSON.stringify(storedResponses));
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
        />
        <ResultList
          results={results}
          interimResult={listening ? transcript : null}
          setIsLoading={setIsLoading}
        />
        <ClearButton onClear={() => setResults([])} />

        <AIResponse
          feedback={feedback}
          isOpen={isDrawerOpen}
          setIsOpen={setIsDrawerOpen}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default SpeechButton;
