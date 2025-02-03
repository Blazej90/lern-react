const MicrophoneButton: React.FC<{
  isRecording: boolean;
  onClick: () => void;
}> = ({ isRecording, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full flex items-center justify-center bg-blue-500 text-white 
        ${isRecording ? "bg-red-500" : "hover:bg-blue-600"}`}
    >
      {isRecording ? "Stop Recording" : "Start Recording"}
    </button>
  );
};

export default MicrophoneButton;
