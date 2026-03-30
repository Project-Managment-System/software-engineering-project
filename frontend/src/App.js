import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';

// Styles
import './App.css';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// Base Portal (Home Page)
import Portal from './pages/Portal';

// Auth & Dashboard Pages
import AdminLogin from './pages/admin/Login';
import AdminRegister from './pages/admin/Register';
import AdminDashboard from './pages/admin/Dashboard';
import EngineerLogin from './pages/engineer/Login';
import EngineerRegister from './pages/engineer/Register';
import EngineerDashboard from './pages/engineer/Dashboard';
import UserLogin from './pages/user/Login';
import UserRegister from './pages/user/Register';
import UserDashboard from './pages/user/Dashboard';
import OpsLogin from './pages/ops/Login';
import OpsRegister from './pages/ops/Register';
import OpsDashboard from './pages/ops/Dashboard';

/**
 * Layout for Auth Pages (Login, Register)
 * We keep the Header/Footer here, but we EXCLUDE the Home page from this.
 */
const AuthLayout = ({ isDark, setIsDark }) => (
  <div className={`App ${isDark ? 'dark-theme bg-[#010409]' : 'light-theme bg-slate-50'} min-h-screen flex flex-col transition-colors duration-500`}>
    <Header isDark={isDark} setIsDark={setIsDark} />
    <main className="flex-grow relative">
      <BackToHomeButton />
      <Outlet />
    </main>
    <Footer isDark={isDark} />
  </div>
);

/**
 * Layout for Dashboards
 */
const DashboardLayout = ({ isDark }) => (
  <div className={`Dashboard-Root ${isDark ? 'dark-theme bg-[#0d1117]' : 'light-theme bg-white'} min-h-screen`}>
    <BackToHomeButton />
    <Outlet />
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function BackToHomeButton() {
  const navigate = useNavigate();
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <button
      onClick={() => navigate('/')}
      className="fixed top-24 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 group font-bold text-xs uppercase tracking-wider"
    >
      <span>← Back to Portal</span>
    </button>
  );
}

function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* --- 1. PURE HOME PAGE (No Header/Footer Bleeding) --- */}
        <Route path="/" element={<Portal isDark={isDark} setIsDark={setIsDark} />} />

        {/* --- 2. AUTH ROUTES (Login/Register only) --- */}
        <Route element={<AuthLayout isDark={isDark} setIsDark={setIsDark} />}>
          <Route path="/user/login" element={<UserLogin isDark={isDark} />} />
          <Route path="/user/register" element={<UserRegister isDark={isDark} />} />
          <Route path="/engineer/login" element={<EngineerLogin isDark={isDark} />} />
          <Route path="/engineer/register" element={<EngineerRegister isDark={isDark} />} />
          <Route path="/admin/login" element={<AdminLogin isDark={isDark} />} />
          <Route path="/admin/register" element={<AdminRegister isDark={isDark} />} />
          <Route path="/ops/login" element={<OpsLogin isDark={isDark} />} />
          <Route path="/ops/register" element={<OpsRegister isDark={isDark} />} />
        </Route>

        {/* --- 3. DASHBOARD ROUTES --- */}
        <Route element={<DashboardLayout isDark={isDark} />}>
          <Route path="/user/dashboard" element={<UserDashboard isDark={isDark} />} />
          <Route path="/engineer/dashboard" element={<EngineerDashboard isDark={isDark} />} />
          <Route path="/admin/dashboard" element={<AdminDashboard isDark={isDark} />} />
          <Route path="/ops/dashboard" element={<OpsDashboard isDark={isDark} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;