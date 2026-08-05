import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';

// Components
import Footer from './components/Footer/Footer.jsx';
import './App.css';

// Landing Portal
import Portal from './pages/Portal';
import DivisionLogin from './pages/DivisionLogin';

// Admin Pages
// Every dashboard below is lazy-loaded: with ~15 dashboards previously all imported eagerly,
// every user's first page load downloaded the JS for all of them regardless of which single
// one they'd actually visit. React.lazy defers each dashboard's code to when its route is
// actually navigated to, so the initial bundle only contains the page being viewed.
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));

// Head Office Pages
const HeadOfficeLogin = lazy(() => import('./pages/HeadOffice/Login'));
const HeadOfficeDashboard = lazy(() => import('./pages/HeadOffice/Dashboard'));

// Head Office → Branch Dashboards (login is unified through /headoffice/login)
const DesignEngineerDashboard = lazy(() => import('./pages/Design/Engineer/Dashboard'));
const DesignDirectorDashboard = lazy(() => import('./pages/Design/Director/Dashboard'));
const DesignJobDetails = lazy(() => import('./pages/Design/JobDetails'));
const BranchAEngineerDashboard = lazy(() => import('./pages/BranchA/Engineer/Dashboard'));
const BranchADirectorDashboard = lazy(() => import('./pages/BranchA/Director/Dashboard'));
const BranchBEngineerDashboard = lazy(() => import('./pages/BranchB/Engineer/Dashboard'));
const BranchBDirectorDashboard = lazy(() => import('./pages/BranchB/Director/Dashboard'));
const BranchCEngineerDashboard = lazy(() => import('./pages/BranchC/Engineer/Dashboard'));
const BranchCDirectorDashboard = lazy(() => import('./pages/BranchC/Director/Dashboard'));
const BranchDEngineerDashboard = lazy(() => import('./pages/BranchD/Engineer/Dashboard'));
const BranchDDirectorDashboard = lazy(() => import('./pages/BranchD/Director/Dashboard'));

// Engineer Pages
const EngineerDashboard = lazy(() => import('./pages/engineer/Dashboard'));
const EngineerLogin = lazy(() => import('./pages/engineer/Login'));

// User Pages
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const UserLogin = lazy(() => import('./pages/user/Login'));

// Divisional Assistant Pages
const DivisionalAssistantDashboard = lazy(() => import('./pages/DivisionalAssistant/Dashboard'));

// Shown briefly while a route's chunk downloads on first visit — matches the app's brand palette
const RouteLoadingFallback = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f8fafc'
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      border: '3px solid #90D5FF55', borderTopColor: '#006EB1',
      animation: 'route-spin 0.8s linear infinite'
    }} />
    <style>{'@keyframes route-spin { to { transform: rotate(360deg); } }'}</style>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Routes define the content that changes based on the URL */}
      <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Main Entry Points */}
        <Route path="/" element={
          <RedirectIfAuthenticated><Portal /><Footer /></RedirectIfAuthenticated>
        } />
        <Route path="/division/login" element={
          <RedirectIfAuthenticated><DivisionLogin /></RedirectIfAuthenticated>
        } />
        <Route path="/headoffice/login" element={
          <RedirectIfAuthenticated><HeadOfficeLogin /></RedirectIfAuthenticated>
        } />
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
        <Route path="/design/job/:jobNo" element={
          <ProtectedRoute allowedRoles={['branch_engineer', 'branch_director', 'engineer', 'division_assistant']}>
            <DesignJobDetails />
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
        <Route path="/admin/login" element={
          <RedirectIfAuthenticated><AdminLogin /></RedirectIfAuthenticated>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'clerk']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Engineer Routes */}
        <Route path="/engineer/login" element={
          <RedirectIfAuthenticated><EngineerLogin /></RedirectIfAuthenticated>
        } />
        <Route path="/engineer/dashboard" element={
          <ProtectedRoute allowedRoles={['engineer']}>
            <EngineerDashboard />
          </ProtectedRoute>
        } /> 
        
        {/* User Routes */}
        <Route path="/user/login" element={
          <RedirectIfAuthenticated><UserLogin /></RedirectIfAuthenticated>
        } />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;