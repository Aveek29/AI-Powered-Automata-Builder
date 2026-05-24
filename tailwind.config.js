/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "bounce-short": "bounceShort 0.5s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
        "glow-pulse": "glowPulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(59, 130, 246, 0.2)" },
          "50%": { boxShadow: "0 0 24px rgba(59, 130, 246, 0.4), 0 0 48px rgba(59, 130, 246, 0.1)" },
        },
        bounceShort: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px var(--theme-primary, #3b82f6)" },
          "50%": { boxShadow: "0 0 20px var(--theme-primary, #3b82f6), 0 0 40px var(--theme-primary, #3b82f6)" },
        },
      },
    },
  },
  plugins: [],
};
