import { useState } from "react";
import { convertToAutomata } from "./convertNLP";

const examples = [
  "If input is 0 go to B else stay in A",
  "Start at S. On 0 go to A, on 1 go to B. From A on 0 go to B, on 1 go to S. From B on 0 go to S, on 1 go to A",
  "State Q0: on a go to Q1, on b stay. State Q1: on a go to Q0, on b go to Q2. State Q2: on a go to Q2, on b go to Q0",
  "DFA with states q0,q1,q2. Start q0. q2 accepting. q0 on 0->q1, on 1->q0. q1 on 0->q2, on 1->q0. q2 on 0->q2, on 1->q2",
];

export default function ParserInput({ onAutomataParsed, setLoading }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (!text.trim()) return;
    setError("");
    setLoading?.(true);

    try {
      const result = await convertToAutomata(text);
      onAutomataParsed(result, text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading?.(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleConvert();
    }
  };

  return (
    <div>
      <div className="relative">
        <textarea
          className="input-field resize-none pr-10"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your automaton in natural language..."
        />
        {text && (
          <button
            onClick={() => setText("")}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          className="btn-success flex items-center gap-2"
          onClick={handleConvert}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Convert to Automata
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Try an example
        </p>
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex, i) => (
            <button
              key={i}
              className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 transition-colors"
              onClick={() => setText(ex)}
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
