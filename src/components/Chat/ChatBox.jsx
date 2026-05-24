import { useState, useEffect, useRef } from "react";
import { askGroq } from "../../api/groq";
import Message from "./Message";
import { loadChatHistory, saveChatHistory, clearChatHistory } from "./chatUtils";

export default function ChatBox() {
  const [messages, setMessages] = useState(loadChatHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await askGroq(newMessages);
      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    setMessages([]);
    clearChatHistory();
  };

  return (
    <div className="card flex flex-col h-full overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/30 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            AI Chatbot
          </h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scroll-smooth bg-gradient-to-b from-transparent via-transparent to-gray-50/30 dark:to-gray-900/20"
        style={{ minHeight: 300, maxHeight: 420 }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center mt-8">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
              Ask anything about automata, DFA, or programming...
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex gap-2 bg-white dark:bg-gray-800">
        <input
          className="input-field flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="btn-primary flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}
