import { useState, useMemo, useCallback } from "react";

function generateQuestions(automata) {
  if (!automata || !automata.states || automata.states.length === 0) return [];

  const { states, start, transitions, accepting } = automata;
  const questions = [];

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const pick = (arr, exclude) => {
    const filtered = arr.filter((x) => x !== exclude);
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const allInputs = [...new Set(transitions.map((t) => t.input))];

  if (start) {
    const wrong = shuffle(states.filter((s) => s !== start)).slice(0, 3);
    questions.push({
      id: "start-state",
      question: "Which state is the **start state** of this automaton?",
      options: shuffle([start, ...wrong.slice(0, 2)]),
      answer: start,
      explanation: `The start state is **${start}** — this is where the automaton begins reading input.`,
    });
  }

  if (accepting && accepting.length > 0) {
    const acc = accepting[0];
    const wrong = shuffle(states.filter((s) => !accepting.includes(s))).slice(0, 3);
    questions.push({
      id: "accepting-state",
      question: "Which of these is an **accepting (final) state**?",
      options: shuffle([acc, ...wrong.slice(0, 2)]),
      answer: acc,
      explanation: `**${acc}** is an accepting state. If the automaton ends here, the input string is accepted!`,
    });
  }

  const transitionQ = transitions[Math.floor(Math.random() * transitions.length)];
  if (transitionQ) {
    const wrongTargets = shuffle(states.filter((s) => s !== transitionQ.to)).slice(0, 3);
    questions.push({
      id: "transition-lookup",
      question: `If we are in state **${transitionQ.from}** and read input **"${transitionQ.input}"**, which state do we move to?`,
      options: shuffle([transitionQ.to, ...wrongTargets.slice(0, 2)]),
      answer: transitionQ.to,
      explanation: `From **${transitionQ.from}** on input **"${transitionQ.input}"**, we go to **${transitionQ.to}**.`,
    });
  }

  if (allInputs.length > 0) {
    const input = allInputs[Math.floor(Math.random() * allInputs.length)];
    const from = states[Math.floor(Math.random() * states.length)];
    const t = transitions.find((tr) => tr.from === from && tr.input === input);
    if (t) {
      const wrongTargets = shuffle(states.filter((s) => s !== t.to)).slice(0, 3);
      questions.push({
        id: `transition-${from}-${input}`,
        question: `From state **${from}** with input **"${input}"**, what is the next state?`,
        options: shuffle([t.to, ...wrongTargets.slice(0, 2)]),
        answer: t.to,
        explanation: `**${from}** --"${input}"--> **${t.to}**`,
      });
    } else {
      questions.push({
        id: `transition-invalid-${from}-${input}`,
        question: `From state **${from}** with input **"${input}"**, is there a valid transition?`,
        options: ["Yes", "No"],
        answer: "No",
        explanation: `There is no transition defined from **${from}** on input **"${input}"**. The input would be rejected.`,
      });
    }
  }

  if (states.length >= 2) {
    const testStr = states.slice(0, Math.min(3, states.length)).map((_, i) => {
      const t = transitions.find((tr) => {
        if (i === 0) return tr.from === start;
        return tr.from === states[i - 1];
      });
      return t ? t.input : (allInputs[0] || "0");
    }).join("");

    if (testStr) {
      let cur = start;
      let valid = true;
      for (const ch of testStr) {
        const t = transitions.find((tr) => tr.from === cur && tr.input === ch);
        if (t) cur = t.to;
        else { valid = false; break; }
      }
      const accepted = valid && accepting.includes(cur);

      questions.push({
        id: "string-acceptance",
        question: `Is the string **"${testStr}"** accepted by this automaton?`,
        options: ["Yes", "No"],
        answer: accepted ? "Yes" : "No",
        explanation: accepted
          ? `Processing **"${testStr}"** ends in accepting state **${cur}**, so it is accepted!`
          : valid
            ? `Processing **"${testStr}"** ends in state **${cur}**, which is not an accepting state.`
            : `The string **"${testStr}"** has no valid transition at some point, so it is rejected.`,
      });
    }
  }

  return shuffle(questions).slice(0, 5);
}

function getOptionStyle(option, selected, answer, revealed) {
  const base = "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-left w-full";

  if (!revealed) {
    if (selected === option) return `${base} bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700`;
    return `${base} bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500 active:scale-[0.98]`;
  }

  if (option === answer) {
    return `${base} bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 ring-1 ring-green-400/50`;
  }
  if (selected === option && option !== answer) {
    return `${base} bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700`;
  }
  return `${base} bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 opacity-60`;
}

export default function QuizPanel({ automata }) {
  const questions = useMemo(() => generateQuestions(automata), [automata]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = useCallback((qId, option) => {
    if (revealed[qId]) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));
  }, [revealed]);

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setAnswers({});
    setRevealed({});
    setShowResults(false);
  };

  if (!automata || !automata.states || automata.states.length === 0) return null;

  if (questions.length === 0) {
    return (
      <div className="glass-panel p-5">
        <div className="text-center py-4">
          <svg className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-500">Not enough data to generate quiz questions.</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correct = Object.entries(answers).filter(
      ([qId, ans]) => questions.find((q) => q.id === qId)?.answer === ans
    ).length;
    const percentage = Math.round((correct / questions.length) * 100);

    return (
      <div className="glass-panel p-5 animate-fade-in">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quiz Results
        </h3>
        <div className="text-center py-6">
          <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent mb-2">
            {correct}/{questions.length}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            {percentage >= 80 ? "Great job!" : percentage >= 50 ? "Good effort!" : "Keep practicing!"}
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3 mb-6 max-w-xs mx-auto">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <button
            onClick={handleRestart}
            className="btn-primary text-sm px-4 py-2"
          >
            Try Again
          </button>
        </div>
        <div className="space-y-3 mt-2">
          {questions.map((q) => {
            const isCorrect = answers[q.id] === q.answer;
            return (
              <div key={q.id} className={`p-3 rounded-lg text-sm border ${isCorrect ? "bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-700/30" : "bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-700/30"}`}>
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{q.question.replace(/\*\*/g, "")}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isCorrect ? "✓ Correct" : `✗ Your answer: ${answers[q.id]} · Correct: ${q.answer}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="glass-panel p-5 animate-fade-in">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Quick Quiz
        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-auto">
          {currentQ + 1} of {questions.length}
        </span>
      </h3>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-300"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-3 leading-relaxed">
          {q.question.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={i} className="text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
        <div className="space-y-2">
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt;
            const answered = revealed[q.id];
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                className={getOptionStyle(opt, selected, q.answer, answered)}
                disabled={answered}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {revealed[q.id] && (
        <div className="mb-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-700/30 rounded-lg animate-fade-in">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Explanation</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {q.explanation.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={i} className="text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!revealed[q.id]}
        className="btn-primary text-sm px-4 py-2 w-full disabled:opacity-40"
      >
        {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
      </button>
    </div>
  );
}
