import { useState, useEffect, useCallback, useRef } from "react";

export default function Simulator({ automata, onStateChange }) {
  const [inputString, setInputString] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentState, setCurrentState] = useState(null);
  const [simLog, setSimLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [flashState, setFlashState] = useState(null);
  const [readingChar, setReadingChar] = useState(null);
  const speedRef = useRef(speed);
  const finishedRef = useRef(finished);
  const intervalRef = useRef(null);
  const initializedRef = useRef(false);

  const stateRef = useRef(currentState);
  const stepRef = useRef(currentStep);
  const onStateChangeRef = useRef(onStateChange);
  stateRef.current = currentState;
  stepRef.current = currentStep;
  onStateChangeRef.current = onStateChange;
  speedRef.current = speed;
  finishedRef.current = finished;

  useEffect(() => {
    setCurrentStep(-1);
    setCurrentState(null);
    setSimLog([]);
    setFinished(false);
    setIsRunning(false);
    setPaused(false);
    initializedRef.current = false;
    onStateChangeRef.current?.(null);
    setFlashState(null);
    setReadingChar(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [automata]);

  const getTransition = useCallback(
    (from, input) => {
      if (!automata) return null;
      return automata.transitions.find(
        (t) => t.from === from && t.input === input
      );
    },
    [automata]
  );

  const resetSim = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setPaused(false);
    setCurrentStep(-1);
    setCurrentState(null);
    setSimLog([]);
    setFinished(false);
    initializedRef.current = false;
    onStateChangeRef.current?.(null);
    setFlashState(null);
    setReadingChar(null);
  };

  const doStep = useCallback(() => {
    if (!automata || !inputString) return false;

    const curState = stateRef.current;
    const curStep = stepRef.current;

    if (!initializedRef.current) {
      const start = automata.start || automata.states[0];
      initializedRef.current = true;
      stateRef.current = start;
      stepRef.current = -1;
      setCurrentState(start);
      setFlashState(start);
      onStateChangeRef.current?.(start);
      setCurrentStep(-1);
      setTimeout(() => setFlashState(null), 400);
      setSimLog([{
        step: 0,
        state: start,
        input: null,
        action: `Start at ${start}`,
      }]);
      return true;
    }

    if (finishedRef.current) return false;

    const nextStep = curStep + 1;
    if (nextStep >= inputString.length) {
      const inAccepting = automata.accepting?.includes(curState);
      const result = inAccepting ? "ACCEPTED" : "REJECTED (end of input)";
      setSimLog((prev) => [
        ...prev,
        {
          step: nextStep,
          state: curState,
          input: null,
          action: result,
        },
      ]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
      setPaused(false);
      setFinished(true);
      return false;
    }

    const char = inputString[nextStep];

    setReadingChar(char);
    setTimeout(() => setReadingChar(null), 250);

    const transition = getTransition(curState, char);

    if (transition) {
      const newState = transition.to;
      stateRef.current = newState;
      stepRef.current = nextStep;
      setCurrentState(newState);
      setFlashState(newState);
      onStateChangeRef.current?.(newState);
      setCurrentStep(nextStep);
      setTimeout(() => setFlashState(null), 400);
      setSimLog((prev) => [
        ...prev,
        {
          step: nextStep,
          state: newState,
          input: char,
          action: `→ ${newState}`,
        },
      ]);

      const isEnd = nextStep >= inputString.length - 1;
      if (isEnd) {
        const inAccepting = automata.accepting?.includes(newState);
        const result = inAccepting ? "ACCEPTED" : "REJECTED (end of input)";
        setSimLog((prev) => [
          ...prev,
          {
            step: nextStep + 1,
            state: newState,
            input: null,
            action: result,
          },
        ]);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);
        setPaused(false);
        setFinished(true);
        return false;
      }
    } else {
      setReadingChar(null);
      setSimLog((prev) => [
        ...prev,
        {
          step: nextStep,
          state: curState,
          input: char,
          action: "REJECTED (no transition)",
        },
      ]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
      setPaused(false);
      setFinished(true);
      return false;
    }

    return true;
  }, [automata, inputString, getTransition]);

  const startInterval = useCallback(() => {
    intervalRef.current = setInterval(() => {
      const more = doStep();
      if (!more) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);
        setPaused(false);
      }
    }, speedRef.current);
  }, [doStep]);

  const runFull = () => {
    resetSim();
    setIsRunning(true);
    setPaused(false);

    setTimeout(() => {
      if (!doStep()) return;
      startInterval();
    }, 50);
  };

  const pausePlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPaused(true);
    setIsRunning(false);
  };

  const resumePlay = () => {
    setPaused(false);
    setIsRunning(true);
    startInterval();
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      startInterval();
    }
  };

  const rewindStep = () => {
    if (simLog.length <= 1 || isRunning) return;

    let newLog = simLog.slice();

    if (finished) {
      setFinished(false);
    }

    while (newLog.length > 1) {
      const last = newLog[newLog.length - 1];
      if (last.action === "ACCEPTED" || last.action.startsWith("REJECTED")) {
        newLog.pop();
      } else {
        break;
      }
    }

    if (newLog.length <= 1) {
      const prevEntry = newLog[newLog.length - 1];
      initializedRef.current = true;
      stateRef.current = prevEntry.state;
      stepRef.current = -1;
      setCurrentState(prevEntry.state);
      setCurrentStep(-1);
      setSimLog(newLog);
      onStateChangeRef.current?.(prevEntry.state);
      return;
    }

    newLog.pop();

    const prevEntry = newLog[newLog.length - 1];
    const prevStep = prevEntry.step === 0 && newLog.length === 1 ? -1 : prevEntry.step;

    initializedRef.current = true;
    stateRef.current = prevEntry.state;
    stepRef.current = prevStep;
    setCurrentState(prevEntry.state);
    setCurrentStep(prevStep);
    setSimLog(newLog);
    onStateChangeRef.current?.(prevEntry.state);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!automata) return null;

  const accepting = automata.accepting ||
    (automata.states?.length > 0 ? [automata.states[automata.states.length - 1]] : []);
  const isAccepted =
    currentState !== null &&
    accepting.includes(currentState) &&
    finished;

  const failEntry = simLog.find((e) => e.action.startsWith("REJECTED"));
  const failIndex = failEntry ? failEntry.step : -1;

  const tapeChars = inputString ? inputString.split("") : [];
  const activeIndex = initializedRef.current ? currentStep + 1 : -1;

  const canStep = !isRunning && !paused;
  const canReset = !isRunning || paused;

  return (
    <div className="glass-panel p-5 animate-fade-in">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 theme-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="theme-text">Simulator</span>
      </h3>

      <div className="flex gap-2 mb-3">
        <input
          className="input-field flex-1 font-mono tracking-wider"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          placeholder="Enter input string (e.g. 0101)"
          disabled={isRunning || paused}
        />
      </div>

      <div className="mb-3 -mx-1">
        <div className="flex items-center gap-1 overflow-x-auto py-2 px-1 min-h-[48px] snap-x snap-mandatory">
          {tapeChars.length > 0 ? (
            tapeChars.map((char, i) => {
              let cellClass = "tape-cell shrink-0 snap-start";
              let extraAnim = "";

              if (finished && failIndex >= 0 && i === failIndex) {
                cellClass += " tape-cell-error";
                extraAnim = " animate-shake";
              } else if (i < activeIndex) {
                cellClass += " tape-cell-processed";
              } else if (i === activeIndex && !finished) {
                cellClass += " tape-cell-current";
                extraAnim = " animate-bounce-short";
              } else if (i === activeIndex && finished && isAccepted) {
                cellClass += " tape-cell-current";
              } else if (finished && isAccepted) {
                cellClass += " tape-cell-processed";
              } else if (finished) {
                cellClass += " tape-cell-processed";
              } else {
                cellClass += " tape-cell-upcoming";
              }

              return (
                <div
                  key={i}
                  className={`${cellClass}${extraAnim}`}
                >
                  {char}
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-500 italic px-1">
              Enter a string above to begin simulation
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <button onClick={resetSim} className="btn-secondary text-xs px-3 py-1.5" disabled={!canReset || (currentState === null && !finished)}>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </span>
        </button>
        <button
          onClick={rewindStep}
          disabled={simLog.length <= 1 || isRunning}
          className="btn-secondary text-xs px-3 py-1.5"
          title="Step back"
        >
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
            Rewind
          </span>
        </button>
        <button
          onClick={doStep}
          disabled={!inputString || isRunning || paused || finished}
          className="btn-primary text-xs px-3 py-1.5"
        >
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Step
          </span>
        </button>
        {paused ? (
          <button
            onClick={resumePlay}
            disabled={!inputString}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-sm"
          >
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Resume
            </span>
          </button>
        ) : (
          <button
            onClick={isRunning ? pausePlay : runFull}
            disabled={!inputString}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
              isRunning
                ? "bg-amber-500 text-white"
                : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-sm"
            }`}
          >
            <span className="flex items-center gap-1">
              {isRunning ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Auto Play
                </>
              )}
            </span>
          </button>
        )}
      </div>

      <div className="mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">Speed</span>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-12 text-right">{speed}ms</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Current state:</span>
        <span
          key={currentState + (flashState ? "-flash" : "")}
          className={`font-bold text-lg font-mono transition-all duration-300 ${
            isAccepted
              ? "text-green-500 glow-ring-green rounded-full px-2"
              : flashState
                ? "text-amber-500 scale-125 glow-ring-amber rounded-full px-2"
                : currentState
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400"
          }`}
        >
          {currentState || "\u2014"}
        </span>
        {readingChar && (
          <span className="inline-flex items-center gap-1 text-xs font-mono bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700 animate-fade-in">
            <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            reading "{readingChar}"
          </span>
        )}
        {isAccepted && (
          <span className="text-xs bg-green-500 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse shadow-sm">
            ✓ ACCEPTED
          </span>
        )}
        {currentState !== null && accepting.includes(currentState) && !finished && (
          <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-700">
            Accepting State
          </span>
        )}
        {finished && currentState !== null && !accepting.includes(currentState) && (
          <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full font-medium border border-red-200 dark:border-red-700">
            ✗ REJECTED
          </span>
        )}
      </div>

      {simLog.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 max-h-44 overflow-y-auto transition-colors duration-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100/80 dark:bg-gray-700/50 sticky top-0 backdrop-blur-sm">
                <th className="p-2 text-left font-semibold text-gray-500 dark:text-gray-400 w-10">#</th>
                <th className="p-2 text-left font-semibold text-gray-500 dark:text-gray-400">State</th>
                <th className="p-2 text-left font-semibold text-gray-500 dark:text-gray-400 w-16">Input</th>
                <th className="p-2 text-left font-semibold text-gray-500 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {simLog.map((entry, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-200 dark:border-gray-700 transition-colors ${
                    entry.action.startsWith("REJECTED")
                      ? "bg-red-50 dark:bg-red-900/15"
                      : entry.action === "ACCEPTED"
                        ? "bg-green-50 dark:bg-green-900/15"
                        : entry.action.startsWith("Start")
                          ? "bg-blue-50/50 dark:bg-blue-900/10"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/20"
                  }`}
                >
                  <td className="p-2 text-gray-400 dark:text-gray-500 font-mono">{entry.step}</td>
                  <td className="p-2 font-mono font-medium text-gray-800 dark:text-gray-200">{entry.state}</td>
                  <td className="p-2 font-mono text-gray-600 dark:text-gray-300">{entry.input !== null && entry.input !== undefined ? `"${entry.input}"` : "\u2014"}</td>
                  <td className={`p-2 font-medium ${
                    entry.action.startsWith("REJECTED")
                      ? "text-red-600 dark:text-red-400"
                      : entry.action === "ACCEPTED"
                        ? "text-green-600 dark:text-green-400"
                        : entry.action.startsWith("Start")
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                  }`}>
                    <span className="flex items-center gap-1">
                      {entry.action.startsWith("\u2192") && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                      {entry.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
