const STORAGE_KEY = "ai-automata-chat";
const THEME_KEY = "ai-automata-theme";

export function loadChatHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
  }
}

export function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
  }
}
