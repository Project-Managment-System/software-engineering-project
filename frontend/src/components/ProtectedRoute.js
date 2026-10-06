import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

// Clears session keys so RedirectIfAuthenticated (which only checks localStorage) won't
// immediately bounce a denied user straight back into the dashboard it was just kicked from.
const clearSession = () => {
  ['userId', 'employeeId', 'fullName', 'email', 'role', 'profilePic', 'userDivision', 'userBranch']
    .forEach((key) => localStorage.removeItem(key));
};

const ProtectedRoute = ({ children, allowedRoles = ['admin'], requiredBranch }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied' | 'unreachable'

  const allowedRolesString = allowedRoles.join(',');

  useEffect(() => {
    const verify = async () => {
      const userId = localStorage.getItem('userId');
      const claimedRole = localStorage.getItem('role');

      // No session info at all — don't even bother calling the backend
      if (!userId || !claimedRole || !allowedRoles.includes(claimedRole)) {
        clearSession();
        setStatus('denied');
        return;
      }

      try {
        // Confirm this user actually exists in the DB and really has the allowed role,
        // rather than trusting whatever localStorage happens to say.
        const res = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
        const roleOk = allowedRoles.includes(res.data.role);
        const branchOk = !requiredBranch || res.data.branch === requiredBranch;
        if (roleOk && branchOk) {
          setStatus('allowed');
        } else {
          // Backend gave a definitive answer: this session is no longer valid.
          clearSession();
          setStatus('denied');
        }
      } catch (err) {
        if (err.response) {
          // Server responded (e.g. 404 user not found) — the session is genuinely invalid.
          clearSession();
          setStatus('denied');
        } else {
          // No response at all — backend unreachable/network error. Don't clear the
          // session or bounce to "/", or RedirectIfAuthenticated just sends it right
          // back here, looping forever and looking like a frozen "Checking access..." page.
          setStatus('unreachable');
        }
      }
    };

    verify();
  }, [allowedRolesString, requiredBranch]);

  if (status === 'checking') {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Checking access...</div>;
  }

  if (status === 'unreachable') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Couldn't reach the server. Check your connection and try again.
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;