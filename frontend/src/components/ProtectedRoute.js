import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check for the key 'isAdmin' which you are setting in AdminLogin
  const isAdmin = localStorage.getItem('isAdmin'); 

  if (isAdmin !== 'true') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;