"use client";

import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import ClearButton from "@/components/ClearButton";
import RecordingTimer from "@/components/RecordingTimer";
import MicrophoneButton from "@/components/MicrophoneButton";
import ResultsList from "@/components/ResultList";
import axios from "axios";
import "regenerator-runtime/runtime";
import AIResponse from "@/components/AIResponse";

interface SpeechButtonProps {
  question: string;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({ question }) => {
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [results, setResults] = useState<{ text: string; time: number }[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
  }, [listening]);

  useEffect(() => {
    if (!listening && transcript.trim()) {
      const timeSpent = recordingTime;
      setResults((prevResults) => [
        { text: transcript.trim(), time: timeSpent },
        ...prevResults,
      ]);
      resetTranscript();
      getAIResponse(transcript);
    }
  }, [listening, transcript, resetTranscript]);

  const handleStartListening = () => {
    if (!listening) {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleStopListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    }
  };

  const handleClear = () => {
    setResults([]);
    setFeedback(null);
    resetTranscript();
  };

  const getAIResponse = async (userInput: string) => {
    if (!userInput.trim()) {
      console.error("User input is empty!");
      setFeedback("Please provide some input.");
      return;
    }

    try {
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
    <div className="flex flex-col items-center space-y-6 p-6 bg-gray-800 rounded-lg shadow-md">
      <RecordingTimer isRecording={listening} recordingTime={recordingTime} />
      <MicrophoneButton
        isRecording={listening}
        onClick={listening ? handleStopListening : handleStartListening}
      />
      <ResultsList
        results={results}
        interimResult={listening ? transcript : null}
      />
      <ClearButton onClear={handleClear} />
      <AIResponse feedback={feedback} />
    </div>
  );
};

export default SpeechButton;
