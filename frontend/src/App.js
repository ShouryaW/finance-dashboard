import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import AddTransaction from "./components/AddTransaction";
import Budgets from "./components/Budgets";
import Goals from "./components/Goals";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function Navbar({ onLogout }) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const username = localStorage.getItem("username");
  const navLinks = [
    { path: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { path: "/transactions", label: "Transactions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { path: "/add", label: "Add", icon: "M12 4v16m8-8H4" },
    { path: "/budgets", label: "Budgets", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
    { path: "/goals", label: "Goals", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <Link to="/" className="text-white font-bold text-xl mr-4 flex items-center group">
              <span className="text-2xl mr-2 group-hover:scale-110 transition-transform duration-200">💰</span>
              <span className="bg-clip-text">FinDash</span>
            </Link>
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path ? "bg-white/20 text-white shadow-sm backdrop-blur-sm" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={link.icon} /></svg>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setDarkMode(!darkMode)} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 hover:scale-110" title="Toggle dark mode">
              {darkMode ? "\u2600\uFE0F" : "\uD83C\uDF19"}
            </button>
            <span className="text-white/70 text-sm hidden sm:inline">Hi, <span className="text-white font-medium">{username}</span></span>
            <button onClick={onLogout} className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm hover:bg-white/20 transition-all duration-200 hover:scale-[1.02]">Log Out</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();
  const handleLogin = (token, username) => { localStorage.setItem("token", token); localStorage.setItem("username", username); setIsLoggedIn(true); navigate("/"); };
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("username"); setIsLoggedIn(false); navigate("/login"); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {isLoggedIn && <Navbar onLogout={handleLogout} />}
      <main className={isLoggedIn ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
          <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
