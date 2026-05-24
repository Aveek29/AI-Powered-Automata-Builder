import { Link } from "react-router-dom";

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "AI Chatbot",
    desc: "Ask any question about automata theory, DFA, or programming. Powered by Groq's LLM.",
    color: "blue",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: "NLP Parser",
    desc: "Describe a DFA in plain English and automatically convert it to a structured JSON representation.",
    color: "emerald",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
    title: "Visual Builder",
    desc: "See your automaton rendered as an interactive graph. Step through input strings and watch state transitions.",
    color: "purple",
  },
];

const gradients = {
  blue: "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-green-600",
  purple: "from-purple-500 to-violet-600",
};

const iconGradients = {
  blue: "from-blue-400/20 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-600/5",
  emerald: "from-emerald-400/20 to-green-600/10 dark:from-emerald-400/10 dark:to-green-600/5",
  purple: "from-purple-400/20 to-violet-600/10 dark:from-purple-400/10 dark:to-violet-600/5",
};

const borderColors = {
  blue: "hover:border-blue-300 dark:hover:border-blue-700",
  emerald: "hover:border-emerald-300 dark:hover:border-emerald-700",
  purple: "hover:border-purple-300 dark:hover:border-purple-700",
};

export default function Home() {
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-3.5rem)]">
      <div className="mesh-gradient-bg absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-20 left-[10%] w-6 h-6 text-blue-400/20 dark:text-blue-500/20 animate-float" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <svg className="absolute top-40 right-[15%] w-4 h-4 text-purple-400/20 dark:text-purple-500/20 animate-float-delayed" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <svg className="absolute bottom-40 left-[20%] w-5 h-5 text-emerald-400/20 dark:text-emerald-500/20 animate-float-slow" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <svg className="absolute top-60 left-[40%] w-3 h-3 text-blue-400/15 dark:text-blue-500/15 animate-float" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <svg className="absolute bottom-60 right-[25%] w-7 h-7 text-purple-400/15 dark:text-purple-500/15 animate-float-delayed" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <svg className="absolute top-1/3 left-[60%] w-4 h-4 text-emerald-400/15 dark:text-emerald-500/15 animate-float-slow" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>

        <svg className="absolute top-20 left-[15%] w-32 h-32 text-blue-500/[0.03] dark:text-blue-400/[0.04] animate-mesh" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M20,20 L40,10 L60,25 L80,15 L90,35 L70,50 L85,70 L60,80 L40,70 L20,85 L10,60 L25,40 Z" />
        </svg>
        <svg className="absolute bottom-10 right-[10%] w-40 h-40 text-purple-500/[0.03] dark:text-purple-400/[0.04] animate-mesh" style={{ animationDelay: "-5s" }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M20,20 L40,10 L60,25 L80,15 L90,35 L70,50 L85,70 L60,80 L40,70 L20,85 L10,60 L25,40 Z" />
        </svg>

        <svg className="absolute top-1/2 left-[8%] w-2 h-2 text-blue-500/30 dark:text-blue-400/30 animate-pulse-glow" viewBox="0 0 8 8" fill="currentColor">
          <circle cx="4" cy="4" r="4" />
        </svg>
        <svg className="absolute top-1/4 right-[20%] w-2 h-2 text-purple-500/30 dark:text-purple-400/30 animate-pulse-glow" style={{ animationDelay: "-1s" }} viewBox="0 0 8 8" fill="currentColor">
          <circle cx="4" cy="4" r="4" />
        </svg>
        <svg className="absolute bottom-1/3 left-[50%] w-2 h-2 text-emerald-500/30 dark:text-emerald-400/30 animate-pulse-glow" style={{ animationDelay: "-2s" }} viewBox="0 0 8 8" fill="currentColor">
          <circle cx="4" cy="4" r="4" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto p-4 md:p-8">
        <div className="text-center py-8 md:py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/20 mb-6 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent animate-gradient-text">
              AI Automata Studio
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Describe automata in natural language, visualize them as interactive
            graphs, and simulate input strings&mdash;all powered by AI.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/chat"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-7 py-3.5 rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with AI
            </Link>
            <Link
              to="/automata"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-7 py-3.5 rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Build Automata
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 animate-slide-up relative">
          {features.map((f, i) => (
            <div
              key={i}
              className={`glass-panel p-6 border border-gray-200/50 dark:border-gray-700/30 ${borderColors[f.color]} transition-all duration-300 hover:-translate-y-1 group cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradients[f.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-lg">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {f.desc}
              </p>
              <div className={`mt-4 h-1 w-0 group-hover:w-full rounded-full bg-gradient-to-r ${gradients[f.color]} transition-all duration-300`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
