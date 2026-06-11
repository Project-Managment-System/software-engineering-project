import React from 'react';
import { Lock, User, Wrench, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

export default function EngineerLogin() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Engineer authentication logic goes here
    navigate('/engineer/dashboard');
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
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-8 font-bold text-base"
      >
        <ArrowLeft size={20} /> BACK TO PORTAL
      </button>

      <div className="mb-10 text-center">
        <div className="bg-emerald-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
          <Wrench size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">ENGINEER LOGIN</h2>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        {/* Username Field */}
        <div>
          <label className="block text-base font-bold text-slate-700 mb-2">ENGINEER ID</label>
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="text" 
              required 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none text-base"
              placeholder="Enter Engineer ID"
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
              required 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none text-base"
              placeholder="••••••••"
            />
          </div>
          {/* Forgot Password Link */}
          <div className="text-right mt-3">
            <Link to="/engineer/forgot-password" className="text-sm font-bold text-emerald-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-base hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          ENGINEER SECURE LOGIN
        </button>
      </form>

      {/* Register Link */}
      <p className="mt-8 text-center text-base text-slate-600">
        Need access? {' '}
        <Link to="/engineer/register" className="text-emerald-600 font-bold hover:underline">
          Request registration
        </Link>
      </p>
    </motion.div>
  );
}