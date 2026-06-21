import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, allowedRoles = ['admin'] }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  const allowedRolesString = allowedRoles.join(',');

  useEffect(() => {
    const verify = async () => {
      const userId = localStorage.getItem('userId');
      const claimedRole = localStorage.getItem('role');

      // No session info at all — don't even bother calling the backend
      if (!userId || !claimedRole || !allowedRoles.includes(claimedRole)) {
        setStatus('denied');
        return;
      }

      try {
        // Confirm this user actually exists in the DB and really has the allowed role,
        // rather than trusting whatever localStorage happens to say.
        const res = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
        if (allowedRoles.includes(res.data.role)) {
          setStatus('allowed');
        } else {
          setStatus('denied');
        }
      } catch (err) {
        // User doesn't exist anymore, bad ID, or server unreachable
        setStatus('denied');
      }
    };

    verify();
  }, [allowedRolesString]);

  if (status === 'checking') {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Checking access...</div>;
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;