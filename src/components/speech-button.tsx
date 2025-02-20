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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (!listening && transcript.trim()) {
      const timeSpent = recordingTime;
      setResults((prevResults) => [
        { question, answer: transcript.trim(), time: timeSpent },
        ...prevResults,
      ]);
      resetTranscript();
      getAIResponse(transcript);
      onSave(transcript.trim(), timeSpent);
    }
  }, [listening, transcript, resetTranscript, recordingTime, question, onSave]);

  const handleStartListening = () => {
    if (!listening) {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleStopListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsDrawerOpen(true);
    }
  };

  const handleClear = () => {
    setResults([]);
    setFeedback(null);
    resetTranscript();
    setRecordingTime(0);
    setIsLoading(false);
  };

  const handleDeleteResult = (index: number) => {
    setResults((prevResults) => prevResults.filter((_, i) => i !== index));
  };

  const getAIResponse = async (userInput: string) => {
    if (!userInput.trim()) {
      console.error("User input is empty!");
      setFeedback("Please provide some input.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/openai", {
        userAnswer: userInput,
        question,
      });

      const aiAnswer = response.data.aiAnswer;

      if (aiAnswer) {
        setFeedback(aiAnswer);
      } else {
        setFeedback("Brak odpowiedzi od AI.");
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
          onDelete={handleDeleteResult}
        />
        <ClearButton onClear={handleClear} />
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
