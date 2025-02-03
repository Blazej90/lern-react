const AIResponse: React.FC<{ feedback: string | null }> = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-100">
      <strong className="text-lg font-semibold">Feedback AI:</strong>
      <p className="mt-2 text-gray-700">{feedback}</p>
    </div>
  );
};

export default AIResponse;
