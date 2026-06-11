import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Portal from './pages/Portal';

// Auth & Dashboard Imports
import AdminLogin from './pages/admin/Login';
import AdminRegister from './pages/admin/Register';
import AdminDashboard from './pages/admin/Dashboard';
import ForgotPassword from './pages/user/ForgotPassword'; // <--- Import your new page
import AdminForgotPassword from './pages/admin/AdminForgotPassword'; 
import { EngineerForgotPassword } from './pages/engineer/EngineerForgotPassword';

import EngineerLogin from './pages/engineer/Login';
import EngineerRegister from './pages/engineer/Register';
import EngineerDashboard from './pages/engineer/Dashboard';
import UserLogin from './pages/user/Login';
import UserRegister from './pages/user/Register';
import UserDashboard from './pages/user/Dashboard';


const MinimalLayout = () => <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Outlet /></div>;
const DashboardLayout = () => <div className="Dashboard-Root min-h-screen"><Outlet /></div>;

function App() {
  const [isDark, setIsDark] = useState(true);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portal isDark={isDark} setIsDark={setIsDark} />} />

        {/* --- AUTH ROUTES (Minimal) --- */}
        <Route element={<MinimalLayout />}>
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/forgot-password" element={<ForgotPassword />} /> {/* Added Route */}
          
          <Route path="/engineer/login" element={<EngineerLogin />} />
          <Route path="/engineer/register" element={<EngineerRegister />} />
          <Route path="/engineer/forgot-password" element={<EngineerForgotPassword />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />  
        </Route>

        {/* --- DASHBOARD ROUTES --- */}
        <Route element={<DashboardLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;