import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Footer from './components/Footer/Footer.jsx'; 
import './App.css';

// Landing Portal
import Portal from './pages/Portal';
import DivisionLogin from './pages/DivisionLogin';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';

// Head Office Pages
import HeadOfficeLogin from './pages/HeadOffice/Login';
import HeadOfficeDashboard from './pages/HeadOffice/Dashboard';

// Head Office → Branch Dashboards (login is unified through /headoffice/login)
import DesignEngineerDashboard from './pages/Design/Engineer/Dashboard';
import DesignDirectorDashboard from './pages/Design/Director/Dashboard';
import BranchAEngineerDashboard from './pages/BranchA/Engineer/Dashboard';
import BranchADirectorDashboard from './pages/BranchA/Director/Dashboard';
import BranchBEngineerDashboard from './pages/BranchB/Engineer/Dashboard';
import BranchBDirectorDashboard from './pages/BranchB/Director/Dashboard';
import BranchCEngineerDashboard from './pages/BranchC/Engineer/Dashboard';
import BranchCDirectorDashboard from './pages/BranchC/Director/Dashboard';
import BranchDEngineerDashboard from './pages/BranchD/Engineer/Dashboard';
import BranchDDirectorDashboard from './pages/BranchD/Director/Dashboard';

// Engineer Pages
import EngineerDashboard from './pages/engineer/Dashboard'; 
import EngineerLogin from './pages/engineer/Login';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserLogin from './pages/user/Login';

// Divisional Assistant Pages
import DivisionalAssistantDashboard from './pages/DivisionalAssistant/Dashboard';

function App() {
  return (
    <BrowserRouter>
      {/* Routes define the content that changes based on the URL */}
      <Routes>
        {/* Main Entry Points */}
        <Route path="/" element={<><Portal /><Footer /></>} />
        <Route path="/division/login" element={<DivisionLogin />} />
        <Route path="/headoffice/login" element={<HeadOfficeLogin />} />
        <Route path="/headoffice/dashboard" element={
          <ProtectedRoute allowedRoles={['headoffice_admin']}>
            <HeadOfficeDashboard />
          </ProtectedRoute>
        } />

        {/* Head Office → Branch Dashboard Routes (one Engineer + one Director per branch) */}
        <Route path="/design/engineer/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_engineer']} requiredBranch="design">
            <DesignEngineerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/design/director/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_director']} requiredBranch="design">
            <DesignDirectorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/branch-a/engineer/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_engineer']} requiredBranch="branch-a">
            <BranchAEngineerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/branch-a/director/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_director']} requiredBranch="branch-a">
            <BranchADirectorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/branch-b/engineer/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_engineer']} requiredBranch="branch-b">
            <BranchBEngineerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/branch-b/director/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_director']} requiredBranch="branch-b">
            <BranchBDirectorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/branch-c/engineer/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_engineer']} requiredBranch="branch-c">
            <BranchCEngineerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/branch-c/director/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_director']} requiredBranch="branch-c">
            <BranchCDirectorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/branch-d/engineer/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_engineer']} requiredBranch="branch-d">
            <BranchDEngineerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/branch-d/director/dashboard" element={
          <ProtectedRoute allowedRoles={['branch_director']} requiredBranch="branch-d">
            <BranchDDirectorDashboard />
          </ProtectedRoute>
        } />

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

        {/* Divisional Assistant Routes */}
        <Route path="/divisional-assistant/dashboard" element={
          <ProtectedRoute allowedRoles={['division_assistant']}>
            <DivisionalAssistantDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;