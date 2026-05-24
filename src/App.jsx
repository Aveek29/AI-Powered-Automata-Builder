import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import AutomataPage from "./pages/AutomataPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/automata" element={<AutomataPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
