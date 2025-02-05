import { Button } from "@/components/ui/button";

const ClearButton: React.FC<{ onClear: () => void }> = ({ onClear }) => {
  return <Button onClick={onClear}>Wyczyść odpowiedź</Button>;
};

export default ClearButton;
