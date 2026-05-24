import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

export default function Navbar() {
  const location = useLocation();
  const { mode, colorTheme, toggleMode, setTheme, colorThemes } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/chat", label: "Chat" },
    { to: "/automata", label: "Automata" },
  ];

  return (
    <nav className="navbar-accent sticky top-0 z-50 transition-colors duration-200" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-surface) 80%, transparent)', backdropFilter: 'blur(24px)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-shadow duration-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              AI Automata Studio
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "nav-link-active shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="relative">
              <button
                onClick={() => setShowThemeMenu((v) => !v)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
                title="Color theme"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
              {showThemeMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowThemeMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 min-w-[210px] animate-fade-in">
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1">Theme</p>
                    <div className="max-h-64 overflow-y-auto">
                      {colorThemes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-all ${
                            colorTheme === t.id
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${t.gradient} shadow-sm`} />
                          <span className="flex-1 text-left">{t.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            t.mode === "dark"
                              ? "bg-gray-900 text-gray-400"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {t.mode}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

            <button
              onClick={toggleMode}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
              title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {mode === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
