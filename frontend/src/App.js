import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Landing Portal
import Portal from './pages/Portal';
import DivisionLogin from './pages/DivisionLogin';
import HeadOfficeLogin from './pages/HeadOfficeLogin'; // Added Head Office Login

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';

// Engineer Pages
import EngineerDashboard from './pages/engineer/Dashboard'; 
import EngineerLogin from './pages/engineer/Login';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserLogin from './pages/user/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Entry Points */}
        <Route path="/" element={<Portal />} />
        <Route path="/division/login" element={<DivisionLogin />} />
        <Route path="/headoffice/login" element={<HeadOfficeLogin />} /> {/* Added Route */}
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Engineer Routes */}
        <Route path="/engineer/login" element={<EngineerLogin />} />
        <Route path="/engineer/dashboard" element={<EngineerDashboard />} />       } />
        
        {/* User Routes */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;