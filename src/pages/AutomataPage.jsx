import { useState, useCallback } from "react";
import ParserInput from "../components/Automata/ParserInput";
import GraphView from "../components/Automata/GraphView";
import Simulator from "../components/Automata/Simulator";
import BatchTestingPanel from "../components/Automata/BatchTestingPanel";
import { explainAutomata } from "../components/Automata/convertNLP";
import QuizPanel from "../components/Automata/QuizPanel";
import TutorChatDrawer from "../components/Chat/TutorChatDrawer";

function MarkdownRenderer({ text }) {
  const lines = text.split("\n");
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-1 mb-3 text-gray-700 dark:text-gray-200 text-sm">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  let keyCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextKey = () => `md-${keyCounter++}`;

    if (!trimmed) {
      flushList(nextKey());
      continue;
    }

    const renderInline = (text) => {
      const parts = [];
      let remaining = text;
      let partKey = 0;

      const re = /(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g;
      re.lastIndex = 0;
      let lastIdx = 0;
      let match;

      while ((match = re.exec(remaining)) !== null) {
        if (match.index > lastIdx) {
          parts.push(
            <span key={partKey++}>{remaining.slice(lastIdx, match.index)}</span>
          );
        }
        const token = match[0];
        if (token.startsWith("`") && token.endsWith("`")) {
          parts.push(
            <code key={partKey++} className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-blue-600 dark:text-blue-400">
              {token.slice(1, -1)}
            </code>
          );
        } else if (token.startsWith("**") && token.endsWith("**")) {
          parts.push(
            <strong key={partKey++} className="font-semibold text-gray-900 dark:text-gray-100">
              {token.slice(2, -2)}
            </strong>
          );
        }
        lastIdx = re.lastIndex;
      }
      if (lastIdx < remaining.length) {
        parts.push(<span key={partKey++}>{remaining.slice(lastIdx)}</span>);
      }
      return parts;
    };

    if (trimmed.startsWith("### ")) {
      flushList(nextKey());
      elements.push(
        <h3 key={nextKey()} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList(nextKey());
      elements.push(
        <h2 key={nextKey()} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-5 mb-2">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.slice(2);
      listItems.push(
        <span key={nextKey()}>{renderInline(content)}</span>
      );
      inList = true;
    } else {
      flushList(nextKey());
      elements.push(
        <p key={nextKey()} className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-2">
          {renderInline(trimmed)}
        </p>
      );
    }
  }
  flushList(`final-${keyCounter++}`);

  return <>{elements}</>;
}

const TABS = [
  { id: "builder", label: "Builder & Graph", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
  { id: "tutor", label: "AI Tutor & Quiz", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { id: "batch", label: "Batch Testing", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
];

export default function AutomataPage() {
  const [automata, setAutomata] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [explainingLoading, setExplainingLoading] = useState(false);
  const [explanationError, setExplanationError] = useState("");
  const [descText, setDescText] = useState("");
  const [mobileTab, setMobileTab] = useState("builder");
  const [tutorOpen, setTutorOpen] = useState(false);

  const fetchExplanation = useCallback((desc, result) => {
    setExplanation("");
    setExplanationError("");
    setExplainingLoading(true);
    explainAutomata(desc, result)
      .then((text) => {
        setExplanation(text);
        setExplainingLoading(false);
      })
      .catch((err) => {
        setExplanationError(err.message);
        setExplainingLoading(false);
      });
  }, []);

  const handleAutomataParsed = (result, desc) => {
    setAutomata(result);
    setCurrentState(null);
    setDescText(desc || "");

    if (desc) {
      fetchExplanation(desc, result);
    }
  };

  const handleRegenerateExplanation = () => {
    if (descText && automata) {
      fetchExplanation(descText, automata);
    }
  };

  const TabBar = (
    <div className="lg:hidden mb-4">
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5 shadow-inner">
        {TABS.map((tab) => {
          const active = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                active
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const showOnTab = (tabId) =>
    mobileTab === tabId ? "block" : "hidden";

  const ExplanationPanel = (
    <div className="glass-panel p-4 md:p-5 animate-slide-up">
      <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI Student Explanation
        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-auto">
          {!explainingLoading && explanation && (
            <button
              onClick={handleRegenerateExplanation}
              className="flex items-center gap-1 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          )}
          {explainingLoading && (
            <span className="flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Generating...
            </span>
          )}
        </span>
      </h2>

      {explainingLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {explanationError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">Could not load explanation</p>
              <p className="text-red-500 dark:text-red-400 text-xs">{explanationError}</p>
              <button onClick={handleRegenerateExplanation} className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline">Try again</button>
            </div>
          </div>
        </div>
      )}

      {explanation && !explainingLoading && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg p-4 border border-amber-200/50 dark:border-amber-700/30">
            <MarkdownRenderer text={explanation} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6 animate-fade-in">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-1 theme-text">
          Automata Builder
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Describe a DFA in natural language and watch it come to life as an
          interactive graph.
        </p>
      </div>

      <div className="lg:hidden">
        {TabBar}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* LEFT COLUMN — ParserInput, Raw JSON, AI Explanation, Quiz, Batch */}
        <div className="space-y-4 md:space-y-6">
          <div className="card p-4 md:p-5">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 theme-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="theme-text text-sm md:text-base">Natural Language Input</span>
            </h2>
            <ParserInput
              onAutomataParsed={handleAutomataParsed}
              setLoading={setLoading}
            />
          </div>

          {/* Mobile-only: builder tab shows Graph + Simulator inline */}
          <div className={`lg:hidden ${showOnTab("builder")}`}>
            {automata && (
              <>
                <div className="card p-4 md:p-5 animate-slide-up">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Raw JSON
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 overflow-x-auto max-h-40">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                      {JSON.stringify(automata, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="card p-4 md:p-5">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 theme-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span className="theme-text text-sm md:text-base">Graph</span>{loading && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-normal animate-pulse">(parsing...)</span>
                    )}
                  </h2>
                  <GraphView automata={automata} currentState={currentState} onStateClick={(id) => setCurrentState(id)} />
                </div>
                <Simulator automata={automata} onStateChange={(id) => setCurrentState(id)} />
              </>
            )}
          </div>

          {/* Mobile-only: tutor tab */}
          <div className={`lg:hidden ${showOnTab("tutor")}`}>
            {automata && (
              <>
                {ExplanationPanel}
                <QuizPanel automata={automata} />
              </>
            )}
          </div>

          {/* Mobile-only: batch tab */}
          <div className={`lg:hidden ${showOnTab("batch")}`}>
            {automata && <BatchTestingPanel automata={automata} />}
          </div>

          {/* Desktop: Raw JSON, AI Explanation, Quiz, Batch */}
          <div className="hidden lg:block space-y-4 md:space-y-6">
            {automata && (
              <div className="card p-4 md:p-5 animate-slide-up">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Raw JSON
                </h2>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 overflow-x-auto max-h-40">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                    {JSON.stringify(automata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {automata && ExplanationPanel}
            {automata && <QuizPanel automata={automata} />}
            {automata && <BatchTestingPanel automata={automata} />}
          </div>
        </div>

        {/* RIGHT COLUMN — Graph + Simulator (desktop only) */}
        <div className="hidden lg:block space-y-4 md:space-y-6">
          {automata && (
            <div className="card p-4 md:p-5">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 theme-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span className="theme-text text-sm md:text-base">Graph</span>{loading && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-normal animate-pulse">(parsing...)</span>
                )}
              </h2>
              <GraphView automata={automata} currentState={currentState} onStateClick={(id) => setCurrentState(id)} />
            </div>
          )}
          {automata && <Simulator automata={automata} onStateChange={(id) => setCurrentState(id)} />}
        </div>
      </div>

      {automata && (
        <>
          <button
            onClick={() => setTutorOpen(true)}
            className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
            title="Ask AI Tutor"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-ping opacity-25 group-hover:opacity-40" style={{ animationDuration: "2s" }} />
            <svg className="w-7 h-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          <TutorChatDrawer
            open={tutorOpen}
            onClose={() => setTutorOpen(false)}
            automata={automata}
            description={descText}
          />
        </>
      )}
    </div>
  );
}
