import React from "react";

const ResultsList: React.FC<{
  results: { text: string; time: number }[];
  interimResult: string | null;
}> = ({ results, interimResult }) => {
  const uniqueResults = results.filter(
    (result, index, self) =>
      index ===
      self.findIndex((r) => r.text === result.text && r.time === result.time)
  );

  return (
    <ul className="space-y-4">
      {uniqueResults.map((result, index) => (
        <li key={index}>
          <div className="text-black dark:text-white">{result.text}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Czas odpowiedzi: {formatTime(result.time)}
          </div>
        </li>
      ))}
      {interimResult && (
        <li>
          <div className="text-black dark:text-white">{interimResult}</div>
        </li>
      )}
    </ul>
  );
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default ResultsList;
