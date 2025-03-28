import { Button } from "@/components/ui/button";

const MicrophoneButton: React.FC<{
  isRecording: boolean;
  onClick: () => void;
  onStop: () => void;
}> = ({ isRecording, onClick, onStop }) => {
  return (
    <Button
      onClick={isRecording ? onStop : onClick}
      className={
        isRecording
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
      }
    >
      {isRecording ? "Stop Recording" : "Start Recording"}
    </Button>
  );
};

export default MicrophoneButton;
