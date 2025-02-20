import { Button } from "@/components/ui/button";

const ClearButton: React.FC<{ onClear: () => void }> = ({ onClear }) => {
  return (
    <Button
      onClick={onClear}
      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
    >
      Wyczyść wszystkie odpowiedzi
    </Button>
  );
};

export default ClearButton;
