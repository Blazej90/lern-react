import { Button } from "@/components/ui/button";

const MicrophoneButton: React.FC<{
  isRecording: boolean;
  onClick: () => void;
}> = ({ isRecording, onClick }) => {
  return (
    <Button
      onClick={onClick}
      className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
    >
      {isRecording ? "Stop Recording" : "Start Recording"}
    </Button>
  );
};

export default MicrophoneButton;
