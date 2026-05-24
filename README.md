# AI-Powered Automata Studio
Describe a DFA in natural language and visualize it as an interactive graph. Step through input strings, batch-test, and learn with auto-generated quizzes.
## Setup
```bash
npm install
cp .env.example .encv enter Api details
npm run dev
```
## Deploy on Vercel
Set `VITE_GROQ_API_KEY` in Vercel's environment variables. The framework auto-detects as Vite.
## Built With
- React 19, Vite, Tailwind CSS
- React Flow (graph visualization)
- Groq API (Llama 3.3 70B for NLP parsing)
