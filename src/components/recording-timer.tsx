const RecordingTimer: React.FC<{
  isRecording: boolean;
  recordingTime: number;
}> = ({ isRecording, recordingTime }) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return [hours, minutes, seconds]
      .map((unit) => unit.toString().padStart(2, "0"))
      .join(":");
  };

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
