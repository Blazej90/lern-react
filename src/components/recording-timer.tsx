"use client";

import React from "react";
import { formatTime } from "@/lib/utils";
import { Clock } from "lucide-react";

const RecordingTimer: React.FC<{
  isRecording: boolean;
  recordingTime: number;
}> = ({ isRecording, recordingTime }) => {
  return (
    <div
      className={`flex items-center gap-2 text-base sm:text-xl md:text-2xl font-semibold ${
        isRecording ? "text-green-600 dark:text-green-400" : "text-gray-500"
      }`}
    >
      <Clock className="w-5 h-5" />
      <span className="font-mono">
        {isRecording ? formatTime(recordingTime) : "00:00"}
      </span>
    </div>
  );
};

export default RecordingTimer;
