import { useState, useEffect, useCallback } from "react";

const THEME_KEY = "ai-automata-theme";
const COLOR_THEME_KEY = "ai-automata-color-theme";

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const colorThemes = [
  { id: "light", label: "Light Glass", primary: "#3b82f6", mode: "light", bg: "#f0f5ff", surface: "#ffffff", gradient: "from-blue-500 to-blue-600" },
  { id: "dark", label: "Classic Dark", primary: "#3b82f6", mode: "dark", bg: "#0b1120", surface: "#1a2332", gradient: "from-blue-500 to-blue-600" },
  { id: "synthwave", label: "Midnight Synth", primary: "#00ffff", mode: "dark", bg: "#0a0015", surface: "#1a0033", gradient: "from-cyan-400 to-sky-500" },
  { id: "aurora", label: "Nordic Aurora", primary: "#2dd4bf", mode: "dark", bg: "#0b1a1a", surface: "#162e2e", gradient: "from-teal-400 to-cyan-500" },
  { id: "moss", label: "Forest Moss", primary: "#eab308", mode: "dark", bg: "#0a0f05", surface: "#162011", gradient: "from-yellow-500 to-amber-600" },
  { id: "amber", label: "Solarized Amber", primary: "#f97316", mode: "dark", bg: "#100a05", surface: "#261a10", gradient: "from-orange-500 to-amber-600" },
  { id: "rose", label: "Sakura Blossom", primary: "#f472b6", mode: "light", bg: "#fff0f5", surface: "#ffffff", gradient: "from-pink-400 to-rose-500" },
  { id: "dracula", label: "Dracula Midnight", primary: "#a855f7", mode: "dark", bg: "#0d001a", surface: "#1a0033", gradient: "from-purple-500 to-violet-600" },
  { id: "cyber", label: "Cyber Orange", primary: "#f97316", mode: "dark", bg: "#080808", surface: "#1a1410", gradient: "from-orange-500 to-red-600" },
  { id: "monochrome", label: "Sleek Steel", primary: "#94a3b8", mode: "dark", bg: "#0a0a0a", surface: "#161616", gradient: "from-slate-400 to-gray-500" },
  { id: "oceanic", label: "Deep Oceanic", primary: "#22c55e", mode: "dark", bg: "#000d0d", surface: "#001a1a", gradient: "from-green-500 to-emerald-600" },
  { id: "retro", label: "Retro Terminal", primary: "#22c55e", mode: "dark", bg: "#000000", surface: "#0a0f0a", gradient: "from-green-400 to-lime-500" },
];

function loadMode() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function loadColorTheme() {
  try {
    const saved = localStorage.getItem(COLOR_THEME_KEY);
    if (saved && colorThemes.find((t) => t.id === saved)) return saved;
  } catch {}
  return "light";
}

function applyTheme(primary, bg, surface) {
  const root = document.documentElement;
  root.style.setProperty("--theme-primary", primary);
  root.style.setProperty("--theme-primary-010", hexToRgba(primary, 0.1));
  root.style.setProperty("--theme-primary-020", hexToRgba(primary, 0.2));
  root.style.setProperty("--theme-primary-030", hexToRgba(primary, 0.3));
  root.style.setProperty("--theme-primary-040", hexToRgba(primary, 0.4));
  root.style.setProperty("--theme-primary-060", hexToRgba(primary, 0.6));
  root.style.setProperty("--theme-primary-080", hexToRgba(primary, 0.8));
  root.style.setProperty("--theme-bg", bg);
  root.style.setProperty("--theme-surface", surface);
}

export function useTheme() {
  const [mode, setMode] = useState(loadMode);
  const [colorTheme, setColorTheme] = useState(loadColorTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, mode);

    const theme = colorThemes.find((t) => t.id === colorTheme);
    if (theme) {
      applyTheme(theme.primary, theme.bg, theme.surface);
    }
    localStorage.setItem(COLOR_THEME_KEY, colorTheme);
  }, [mode, colorTheme]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((themeId) => {
    const theme = colorThemes.find((t) => t.id === themeId);
    if (theme) {
      setColorTheme(themeId);
      setMode(theme.mode);
    }
  }, []);

  return { mode, colorTheme, toggleMode, setTheme, colorThemes };
}
