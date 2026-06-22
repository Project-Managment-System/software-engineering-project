import React, { useState } from 'react';
import { Lock, User, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await loginUser({ employeeId, password });
      
      if (response.data.status === 'LOGIN_SUCCESS') {
        const { role, userId, fullName, email, division } = response.data;
        
        if (role !== 'admin' && role !== 'clerk') {
          alert("Access Denied: Account is not authorized for Admin login.");
          setIsSubmitting(false);
          return;
        }

        // Store session info
        localStorage.setItem('userId', userId);
        localStorage.setItem('employeeId', employeeId);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('email', email || '');
        localStorage.setItem('role', role);
        if (division) localStorage.setItem('userDivision', division);
        localStorage.setItem('isAdmin', 'true'); // Required for route guards

        navigate('/admin/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || error.response?.data?.error || 'Login Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-6 bg-slate-950 overflow-hidden font-sans">
      {/* Premium background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-900 blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/20 z-10"
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-smooth mb-8 font-bold text-xs tracking-wider"
        >
          <ArrowLeft size={16} /> BACK TO PORTAL
        </button>

        <div className="mb-8 text-center">
          <div className="bg-rose-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ADMIN LOGIN</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Secure Terminal Access</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Username/Employee ID Field */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">USERNAME / ID</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-sm text-slate-800 font-medium transition-smooth"
                placeholder="cl0001"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-sm text-slate-800 font-medium transition-smooth"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 hover:bg-rose-600 text-white rounded-xl font-bold text-xs tracking-widest uppercase transition-smooth shadow-lg hover:shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {isSubmitting ? 'SECURE VERIFYING...' : 'ADMIN SECURE LOGIN'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400 font-semibold tracking-wider uppercase">
          Restricted Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
}