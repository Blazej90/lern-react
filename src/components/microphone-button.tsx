import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

const MicrophoneButton: React.FC<{
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}> = ({ isRecording, onStart, onStop }) => {
  return (
    <Button
      onClick={isRecording ? onStop : onStart}
      className={`w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center gap-2
        ${
          isRecording
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        }`}
    >
      {isRecording ? (
        <>
          <MicOff className="w-4 h-4" />
          Zatrzymaj nagrywanie
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          Rozpocznij nagrywanie
        </>
      )}
    </Button>
  );
};

export default MicrophoneButton;
