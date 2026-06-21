import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, User, Lock } from 'lucide-react';
import axios from 'axios';

export default function DivisionLogin() {
  // "username" the user types is actually their employeeId (e.g. enae1, cl0001)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
        employeeId: username,
        password,
      });

      const { role, userId, employeeId, fullName, email, division } = res.data;

      // Store session info for the dashboards to use
      localStorage.setItem('userId', userId);
      localStorage.setItem('employeeId', employeeId);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('email', email || '');
      localStorage.setItem('role', role);
      if (division) localStorage.setItem('userDivision', division);

      // Route based on the real role from the database
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'engineer') {
        navigate('/engineer/dashboard');
      } else {
        // Other roles (e.g. divisional assistant, super admin) aren't
        // supported by the User schema's role enum yet.
        alert('This portal is not yet available for your account role.');
      }
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'USER_NOT_FOUND') {
        alert('No account found with that username.');
      } else if (code === 'INVALID_PASSWORD') {
        alert('Incorrect password. Please try again.');
      } else if (code === 'MISSING_CREDENTIALS') {
        alert('Please enter both username and password.');
      } else {
        alert('Login failed. Please try again.');
        console.error('Login error:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 font-bold">
          <ArrowLeft size={18} className="mr-2" /> BACK TO PORTAL
        </button>

        <div className="text-center mb-8">
          <Shield className="mx-auto text-blue-600 mb-4" size={48} />
          <h2 className="text-3xl font-black">SYSTEM LOGIN</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Username / Employee ID"
              className="w-full pl-12 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60">
            {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}