import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { to: "/chat", label: "Chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { to: "/automata", label: "Automata", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/30 min-h-[calc(100vh-3.5rem)] hidden md:block transition-colors duration-200">
      <div className="p-3">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all duration-150 ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm border border-blue-200/50 dark:border-blue-700/30"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <svg className={`w-5 h-5 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"} transition-colors duration-150`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
