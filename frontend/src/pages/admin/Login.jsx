import React, { useState } from 'react';
import { Lock, User, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../api/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
      
      if (response.data.status === 'LOGIN_SUCCESS') {
        if (response.data.role !== 'admin') {
          alert('Access Denied: This portal is strictly restricted to Administrators.');
          return; 
        }
// Only save session and navigate if they are verified admins
        localStorage.setItem('userId', response.data.userId);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || error.response?.data?.error || 'Login Failed');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-200"
    >
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-bold text-base"
      >
        <ArrowLeft size={20} /> BACK TO PORTAL
      </button>

      <div className="mb-10 text-center">
        <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">ADMIN LOGIN</h2>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        {/* Email Field */}
        <div>
          <label className="block text-base font-bold text-slate-700 mb-2">EMAIL</label>
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 outline-none text-base"
              placeholder="Enter admin email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-base font-bold text-slate-700 mb-2">PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 outline-none text-base"
              placeholder="••••••••"
            />
          </div>
          {/* Forgot Password Link */}
          <div className="text-right mt-3">
            <Link to="/admin/forgot-password" className="text-sm font-bold text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          ADMIN SECURE LOGIN
        </button>
      </form>

      {/* Admin Notice */}
      <p className="mt-8 text-center text-base text-slate-500 font-medium">
        Restricted access for authorized personnel only.
      </p>
    </motion.div>
  );
}