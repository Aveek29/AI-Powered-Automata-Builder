import { useState, useCallback } from "react";

function runDFA(automata, inputStr) {
  if (!automata) return { accepted: false, error: "No automata" };

  const states = automata.states || [];
  const transitions = automata.transitions || [];
  const startState = automata.start || states[0] || null;
  const accepting = automata.accepting || (states.length > 0 ? [states[states.length - 1]] : []);

  if (!startState) return { accepted: false, error: "No start state" };

  let current = startState;

  if (!inputStr) {
    return { accepted: accepting.includes(current), steps: 0 };
  }

  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr[i];
    const transition = transitions.find((t) => t.from === current && t.input === char);

    if (!transition) {
      return { accepted: false, error: `No transition from ${current} on "${char}"`, step: i, state: current };
    }

    current = transition.to;
  }

  return { accepted: accepting.includes(current), steps: inputStr.length, finalState: current };
}

export default function BatchTestingPanel({ automata }) {
  const [batchInput, setBatchInput] = useState("");
  const [results, setResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleRunBatch = useCallback(() => {
    if (!automata || !batchInput.trim()) return;

    setIsTesting(true);
    setResults(null);

    const testStrings = batchInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    const output = testStrings.map((str) => {
      const result = runDFA(automata, str);
      return { input: str, ...result };
    });

    setTimeout(() => {
      setResults(output);
      setIsTesting(false);
    }, 100);
  }, [automata, batchInput]);

  if (!automata) return null;

  const acceptedCount = results ? results.filter((r) => r.accepted).length : 0;
  const totalCount = results ? results.length : 0;

  return (
    <div className="glass-panel p-5 animate-fade-in">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 theme-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <span className="theme-text">Batch Testing</span>
      </h3>

      <div className="mb-3">
        <textarea
          className="input-field font-mono text-sm resize-none"
          rows={3}
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          placeholder="Enter comma-separated strings (e.g. 01, 110, 000, 1111)"
          disabled={isTesting}
        />
      </div>

      <button
        onClick={handleRunBatch}
        disabled={!batchInput.trim() || isTesting}
        className="btn-success text-xs px-3 py-1.5 mb-3"
      >
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
          {isTesting ? "Testing..." : "Run Batch"}
        </span>
      </button>

      {results && (
        <div className="space-y-1.5">
          {totalCount > 0 && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{acceptedCount}/{totalCount} accepted</span>
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    acceptedCount === totalCount ? "bg-green-500" : acceptedCount > 0 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  r.accepted
                    ? "bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${r.accepted ? "bg-green-500" : "bg-red-500"}`} />
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  &ldquo;{r.input}&rdquo;
                </span>
                <span className={`ml-auto font-bold ${r.accepted ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {r.accepted ? "PASS" : "FAIL"}
                </span>
                {r.error && (
                  <span className="text-red-500 dark:text-red-400 ml-1">({r.error})</span>
                )}
                {r.finalState && !r.error && (
                  <span className="text-gray-400 dark:text-gray-500 ml-1">→ {r.finalState}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
