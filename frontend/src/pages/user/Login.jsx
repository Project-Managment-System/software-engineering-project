import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowLeft, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../api/api';

export default function UserLogin() {
  const navigate = useNavigate();
  // Changed state from 'email' to 'employeeId'
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sending employeeId to your backend API
      const response = await loginUser({ employeeId, password });
      
      if (response.data.status === 'LOGIN_SUCCESS') {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('employeeId', employeeId);
        navigate('/user/dashboard');
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
        className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors mb-8 font-bold text-base"
      >
        <ArrowLeft size={20} /> BACK TO PORTAL
      </button>

      <div className="mb-10 text-center">
        <div className="bg-purple-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">USER LOGIN</h2>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        {/* Employee ID Field */}
        <div>
          <label className="block text-base font-bold text-slate-700 mb-2">EMPLOYEE ID</label>
          <div className="relative">
            <Hash className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-purple-500 outline-none text-base"
              placeholder="Enter Employee ID"
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
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-purple-500 outline-none text-base"
              placeholder="••••••••"
            />
          </div>
          {/* Forgot Password Link */}
          <div className="text-right mt-3">
            <Link to="/user/forgot-password" className="text-sm font-bold text-purple-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-base hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
        >
          SECURE LOGIN
        </button>
      </form>

      {/* Register Link */}
      <p className="mt-8 text-center text-base text-slate-600">
        New here? {' '}
        <Link to="/user/register" className="text-purple-600 font-bold hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}