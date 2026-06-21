import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    const verify = async () => {
      const userId = localStorage.getItem('userId');
      const claimedRole = localStorage.getItem('role');

      // No session info at all — don't even bother calling the backend
      if (!userId || claimedRole !== 'admin') {
        setStatus('denied');
        return;
      }

      try {
        // Confirm this user actually exists in the DB and really is an admin,
        // rather than trusting whatever localStorage happens to say.
        const res = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
        if (res.data.role === 'admin') {
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
  }, []);

  if (status === 'checking') {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Checking access...</div>;
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;