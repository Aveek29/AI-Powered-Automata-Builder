import { useState, useRef, useEffect } from "react";
import { askGroq } from "../../api/groq";

const SUGGESTIONS = [
  "Explain this DFA in simple terms",
  "Is the string '010' accepted? Walk me through",
  "Explain what each state means",
  "What language does this DFA recognize?",
  "What happens if I input '00'?",
];

export default function TutorChatDrawer({ open, onClose, automata, description }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && automata) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, automata]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildSystemPrompt = () => {
    const automataStr = automata ? JSON.stringify(automata, null, 2) : "none";
    return `You are a friendly, warm AI tutor helping an absolute beginner understand Deterministic Finite Automata (DFA).

Here is the automaton the user is currently working with:
- Natural Language Description: ${description || "Not provided"}
- Automata JSON:
\`\`\`json
${automataStr}
\`\`\`

TUTORING GUIDELINES:
1. Explain concepts in plain, simple language. No jargon without explanation.
2. Be encouraging and patient — the user is learning.
3. When asked about specific states, explain what that state "remembers" about the input seen so far.
4. When asked about a string, trace through the DFA step-by-step showing each transition.
5. Use bold for state names and \`code\` for input symbols.
6. If the user asks something outside automata theory, gently steer back.
7. Keep answers concise but thorough — 2-4 paragraphs max.`;
  };

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading || !automata) return;

    const userMsg = { role: "user", content: msg };
    const systemMsg = { role: "system", content: buildSystemPrompt() };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await askGroq([systemMsg, ...newMessages]);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I couldn't respond: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={onClose} />}

      <div
        className={`fixed bottom-0 right-0 z-50 w-full sm:w-[420px] h-[85vh] sm:h-[600px] sm:bottom-6 sm:right-6 sm:rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t sm:border border-gray-200/80 dark:border-gray-700/80 shadow-2xl flex flex-col transition-all duration-300 ease-out ${
          open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/60 dark:border-gray-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200">AI Tutor</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">Context-aware automata help</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ask me anything about this DFA</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">I can explain states, test strings, or walk through transitions in plain language.</p>
              <div className="mt-6 w-full space-y-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s)}
                    className="w-full text-left text-xs px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-3 h-3 shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-500 text-white rounded-br-md shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700/70 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-200/60 dark:border-gray-700/60 p-4 shrink-0 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              className="input-field flex-1 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this automaton..."
              disabled={loading || !automata}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim() || !automata}
              className="btn-primary px-4 flex items-center justify-center disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
