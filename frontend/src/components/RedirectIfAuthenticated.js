import React from 'react';
import { Navigate } from 'react-router-dom';

// Where a logged-in user's role sends them. Keeps the browser's back button from ever
// landing on a login/portal page while a session is still active — the only way to reach
// a login form again is to actually log out first (which clears these localStorage keys).
export const getDashboardPathForSession = () => {
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  if (!role || !userId) return null;

  switch (role) {
    case 'admin':
    case 'clerk':
      return '/admin/dashboard';
    case 'engineer':
      return '/engineer/dashboard';
    case 'user':
      return '/user/dashboard';
    case 'division_assistant':
      return '/divisional-assistant/dashboard';
    case 'headoffice_admin':
      return '/headoffice/dashboard';
    case 'branch_engineer': {
      const branch = localStorage.getItem('userBranch');
      return branch ? `/${branch}/engineer/dashboard` : null;
    }
    case 'branch_director': {
      const branch = localStorage.getItem('userBranch');
      return branch ? `/${branch}/director/dashboard` : null;
    }
    default:
      return null;
  }
};

// Wraps a public page (Portal home, any login form). If a session is already active,
// bounce straight to that account's dashboard instead of showing the login form —
// pressing "back" from inside a dashboard should never expose a way to sign in as
// someone else without logging out first.
const RedirectIfAuthenticated = ({ children }) => {
  const dashboardPath = getDashboardPathForSession();
  if (dashboardPath) {
    return <Navigate to={dashboardPath} replace />;
  }
  return <>{children}</>;
};

export default RedirectIfAuthenticated;
