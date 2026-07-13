import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, User, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { loginUser } from '../api/api';
// Component animation frames
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

const titleContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const letterVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 12, stiffness: 200 }
  }
};

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
      if (role === 'admin' || role === 'clerk') {
        localStorage.setItem('isAdmin', 'true'); // required by ProtectedRoute guard
        navigate('/admin/dashboard');
      } else if (role === 'engineer') {
        navigate('/engineer/dashboard');
      } else if (role === 'user') {
        localStorage.setItem('isAuthenticated', 'true'); // required by UserDashboard guard
        navigate('/user/dashboard');
      } else if (role === 'division_assistant') {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/divisional-assistant/dashboard');
      } else {
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

  const pageTitle = "DIVISION LOGIN";

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-6 antialiased font-sans bg-cover bg-center bg-fixed bg-slate-900"
      style={{
        backgroundImage: `url("https://i.pinimg.com/736x/aa/f5/52/aaf552b182a4253d5ec0de4aa4838af6.jpg")`
      }}
    >
      {/* Background Image Safety Layer (Kept clear/transparent to maintain original image colors) */}
      <div className="absolute inset-0 bg-black/5 z-0 pointer-events-none" />

      {/* Main Form Box Structure */}
      <motion.div
        variants={formContainerVariants}
        initial="hidden"
        animate="show"
        className="relative bg-white/85 backdrop-blur-2xl border border-[#90D5FF]/40 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl z-20 flex flex-col overflow-hidden"
      >
        {/* Inner Subtle White Edge Highlight Framing */}
        <div className="absolute inset-0 border border-white/60 rounded-[2.5rem] pointer-events-none z-30" />

        {/* Header Navigation Link Back */}
        <motion.div variants={itemVariants} className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-xs font-bold tracking-widest text-[#006EB1] hover:text-[#002B49] uppercase transition-colors group"
          >
            <ArrowLeft size={14} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Portal
          </button>
        </motion.div>

        {/* Animated Brand Header */}
        <div className="mb-8">
          <motion.h2
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl font-black tracking-tight text-[#002B49] uppercase flex items-center select-none mb-2"
          >
            {pageTitle.split("").map((char, index) => (
              <motion.span key={index} variants={letterVariants}>
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-600 text-sm font-medium">
            Enter enterprise credentials to access your administrative hub.
          </motion.p>
        </div>

        {/* Authorization Form Segment */}
        <form onSubmit={handleLogin} className="space-y-5 relative z-20">

          {/* Username Controlled Core Input Field Container */}
          <motion.div variants={itemVariants} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006EB1]/70">
              <User size={18} />
            </span>
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-12 pr-4 py-4 bg-white/60 border border-[#90D5FF]/40 rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:ring-2 focus:ring-[#006EB1] focus:border-[#006EB1] outline-none transition-all duration-300 text-sm shadow-inner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </motion.div>

          {/* Password Controlled Core Input Field Container */}
          <motion.div variants={itemVariants} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006EB1]/70">
              <Lock size={18} />
            </span>
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-white/60 border border-[#90D5FF]/40 rounded-xl text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:ring-2 focus:ring-[#006EB1] focus:border-[#006EB1] outline-none transition-all duration-300 text-sm shadow-inner"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </motion.div>

          {/* Submit/Execution Operational Action Button */}
          <motion.div variants={itemVariants} className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 hover:from-[#006EB1] hover:to-[#005a91] text-white font-bold text-xs tracking-[0.2em] rounded-xl transition-all duration-300 shadow-xl active:scale-[0.99] uppercase border border-slate-800 hover:border-[#90D5FF] disabled:opacity-60"
            >
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </motion.div>
        </form>

        {/* Subtle Security Notice Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
        >
          <ShieldAlert size={12} className="text-[#006EB1]" />
          SECURE ENCRYPTED NODE
        </motion.div>
      </motion.div>
    </div>
  );
}