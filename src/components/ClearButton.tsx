const ClearButton: React.FC<{ onClear: () => void }> = ({ onClear }) => {
  return (
    <button
      onClick={onClear}
      className="px-4 py-2 mt-4 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      Wyczyść odpowiedź
    </button>
  );
};

export default ClearButton;
