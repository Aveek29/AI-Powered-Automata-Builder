import { useState } from "react";

export default function Message({ role, content }) {
  const isUser = role === "user";
  const isError = content.startsWith("Error:") || content.startsWith("Groq API error:");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md shadow-md shadow-blue-500/20"
            : isError
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-bl-md shadow-sm"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold opacity-70 flex items-center gap-1">
            {isUser ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                You
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 01.504.868v1.764a1 1 0 00.504.868l3.5 2a1 1 0 010 1.736l-3.5 2a1 1 0 00-.504.868v1.764a1 1 0 01-.504.868l-1.75 1a1 1 0 01-.992 0l-1.75-1a1 1 0 01-.504-.868v-1.764a1 1 0 00-.504-.868l-3.5-2a1 1 0 010-1.736l3.5-2a1 1 0 00.504-.868V3a1 1 0 01.504-.868l1.75-1z" clipRule="evenodd" />
                </svg>
                AI
              </>
            )}
          </p>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity active:scale-90"
            >
              {copied ? (
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
