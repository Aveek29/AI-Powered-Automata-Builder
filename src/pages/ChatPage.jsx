import ChatBox from "../components/Chat/ChatBox";

export default function ChatPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          AI Chat
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ask anything about automata theory, DFA, NFA, regular expressions, or
          programming.
        </p>
      </div>
      <div className="h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] min-h-[400px] md:min-h-[500px]">
        <ChatBox />
      </div>
    </div>
  );
}
