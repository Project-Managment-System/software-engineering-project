import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HardHat, Lock, User, ShieldAlert, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fixed demo credentials for the Design section's Engineer preview (not tied to any real engineer account)
const DESIGN_ENGINEER_USERNAME = 'eng123';
const DESIGN_ENGINEER_PASSWORD = '123';

const formContainerVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 20, staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function DesignEngineerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username.trim() === DESIGN_ENGINEER_USERNAME && password === DESIGN_ENGINEER_PASSWORD) {
      setError('');
      localStorage.setItem('designEngineerAuth', 'true');
      localStorage.setItem('role', 'design_engineer');
      localStorage.setItem('fullName', 'Engineer (Design Preview)');
      localStorage.setItem('employeeId', DESIGN_ENGINEER_USERNAME);
      navigate('/design/engineer/dashboard');
    } else {
      setError('Invalid ID or password.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 antialiased font-sans bg-slate-900">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-900 blur-[120px] pointer-events-none" />

      <motion.div
        variants={formContainerVariants}
        initial="hidden"
        animate="show"
        className="relative bg-white/90 backdrop-blur-2xl border border-emerald-200/40 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl z-20 flex flex-col overflow-hidden"
      >
        <div className="absolute inset-0 border border-white/60 rounded-[2.5rem] pointer-events-none z-30" />

        <motion.div variants={itemVariants} className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-xs font-bold tracking-widest text-emerald-600 hover:text-emerald-800 uppercase transition-colors group"
          >
            <ArrowLeft size={14} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Portal
          </button>
        </motion.div>

        <div className="flex items-center gap-5 mb-8">
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 shadow-sm select-none"
          >
            <HardHat size={26} strokeWidth={2} />
          </motion.div>

          <div>
            <motion.h2 variants={itemVariants} className="text-3xl font-black tracking-tight text-slate-900 uppercase select-none">
              ENGINEER
            </motion.h2>
            <motion.p variants={itemVariants} className="text-slate-600 text-sm font-medium">
              Design Section Preview
            </motion.p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-20">
          <motion.div variants={itemVariants} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/70">
              <User size={18} />
            </span>
            <input
              type="text"
              placeholder="Engineer ID"
              className="w-full pl-12 pr-4 py-4 bg-white/60 border border-emerald-200/50 rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-sm shadow-inner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/70">
              <Lock size={18} />
            </span>
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-white/60 border border-emerald-200/50 rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-sm shadow-inner"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs font-bold"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs tracking-[0.2em] rounded-xl transition-all duration-300 shadow-xl active:scale-[0.99] uppercase border border-slate-800 hover:border-emerald-400"
            >
              SIGN IN
            </button>
          </motion.div>
        </form>

        <motion.div
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
        >
          <ShieldAlert size={12} className="text-emerald-600" />
          DESIGN PREVIEW ACCESS
        </motion.div>
      </motion.div>
    </div>
  );
}
