import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Footer from './components/Footer/Footer.jsx'; 
import './App.css';

// Landing Portal
import Portal from './pages/Portal';
import DivisionLogin from './pages/DivisionLogin';
import HeadOfficeLogin from './pages/HeadOfficeLogin';

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
      {/* Routes define the content that changes based on the URL */}
      <Routes>
        {/* Main Entry Points */}
        <Route path="/" element={<><Portal /><Footer /></>} />
        <Route path="/division/login" element={<DivisionLogin />} />
        <Route path="/headoffice/login" element={<HeadOfficeLogin />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'clerk']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Engineer Routes */}
        <Route path="/engineer/login" element={<EngineerLogin />} />
        <Route path="/engineer/dashboard" element={
          <ProtectedRoute allowedRoles={['engineer']}>
            <EngineerDashboard />
          </ProtectedRoute>
        } /> 
        
        {/* User Routes */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/dashboard" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;