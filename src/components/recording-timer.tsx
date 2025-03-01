"use client";

import React from "react";
import { formatTime } from "@/lib/utils";

const RecordingTimer: React.FC<{
  isRecording: boolean;
  recordingTime: number;
}> = ({ isRecording, recordingTime }) => {
  return (
    <h1
      className={`text-2xl font-semibold ${
        isRecording ? "text-green-500" : "text-gray-500"
      }`}
    >
      Recording: {isRecording ? formatTime(recordingTime) : ""}
    </h1>
  );
};

export default RecordingTimer;
