import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Styles
import './App.css';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// Base Portal
import Portal from './pages/Portal';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminRegister from './pages/admin/Register';
import AdminDashboard from './pages/admin/Dashboard';

// Engineer Pages
import EngineerLogin from './pages/engineer/Login';
import EngineerRegister from './pages/engineer/Register';
import EngineerDashboard from './pages/engineer/Dashboard';

// User Pages
import UserLogin from './pages/user/Login';
import UserRegister from './pages/user/Register';
import UserDashboard from './pages/user/Dashboard';

// Ops Pages
import OpsLogin from './pages/ops/Login';
import OpsRegister from './pages/ops/Register';
import OpsDashboard from './pages/ops/Dashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Separate component for the Back Button logic to use the navigate hook safely
function BackToHomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show the button if we are NOT on the portal page
  if (location.pathname === '/') return null;

  return (
    <button
      onClick={() => navigate('/')}
      className="fixed top-24 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 group"
    >
      <span className="group-hover:-translate-x-1 transition-transform">←</span>
      <span>Back to Portal</span>
    </button>
  );
}

function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <Router>
      <ScrollToTop />
      <div className={`App ${isDark ? 'dark-theme bg-[#010409]' : 'light-theme bg-slate-50'} min-h-screen flex flex-col transition-colors duration-500`}>
        
        <Header isDark={isDark} setIsDark={setIsDark} />

        <main className="flex-grow relative">
          {/* Added the Back to Home Button component here */}
          <BackToHomeButton />

          <Routes>
            {/* The Main Entry Point - Only shows the Portal Cards */}
            <Route path="/" element={<Portal isDark={isDark} />} />

            {/* --- USER SECTION (STRICTLY SEPARATED) --- */}
            {/* When URL is /user/login, ONLY UserLogin is rendered */}
            <Route path="/user/login" element={<UserLogin isDark={isDark} />} />
            
            {/* When URL is /user/dashboard, UserLogin is UNMOUNTED and UserDashboard is rendered */}
            <Route path="/user/dashboard" element={<UserDashboard isDark={isDark} />} />
            
            <Route path="/user/register" element={<UserRegister isDark={isDark} />} />

            {/* --- ENGINEER SECTION --- */}
            <Route path="/engineer/login" element={<EngineerLogin isDark={isDark} />} />
            <Route path="/engineer/dashboard" element={<EngineerDashboard isDark={isDark} />} />
            <Route path="/engineer/register" element={<EngineerRegister isDark={isDark} />} />

            {/* --- ADMIN SECTION --- */}
            <Route path="/admin/login" element={<AdminLogin isDark={isDark} />} />
            <Route path="/admin/dashboard" element={<AdminDashboard isDark={isDark} />} />
            <Route path="/admin/register" element={<AdminRegister isDark={isDark} />} />

            {/* --- OPS SECTION --- */}
            <Route path="/ops/login" element={<OpsLogin isDark={isDark} />} />
            <Route path="/ops/dashboard" element={<OpsDashboard isDark={isDark} />} />
            <Route path="/ops/register" element={<OpsRegister isDark={isDark} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer isDark={isDark} />
      </div>
    </Router>
  );
}

export default App;