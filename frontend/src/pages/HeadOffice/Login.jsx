import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Lock, User, ShieldAlert, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Maps a branch slug (from the user's DB record) to its dashboard route segment
const BRANCH_ROUTE_SLUGS = ['design', 'branch-a', 'branch-b', 'branch-c', 'branch-d'];

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

export default function HeadOfficeLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
        employeeId: username,
        password,
      });

      const { role, userId, employeeId, fullName, email, branch, profilePic } = res.data;

      // Reject accounts that don't belong on this portal BEFORE writing any session
      // data — otherwise a Division-side login "fails" here but silently succeeds the
      // moment the user navigates anywhere else (e.g. RedirectIfAuthenticated picks up
      // the role/userId that got saved and bounces them straight into their real dashboard).
      const isValidHeadOfficeRole =
        role === 'headoffice_admin' ||
        ((role === 'branch_engineer' || role === 'branch_director') && BRANCH_ROUTE_SLUGS.includes(branch));

      if (!isValidHeadOfficeRole) {
        setError('This portal is not available for your account.');
        return;
      }

      localStorage.setItem('userId', userId);
      localStorage.setItem('employeeId', employeeId);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('email', email || '');
      localStorage.setItem('role', role);
      localStorage.setItem('profilePic', profilePic || '');
      localStorage.setItem('isAuthenticated', 'true');
      if (branch) localStorage.setItem('userBranch', branch);

      if (role === 'headoffice_admin') {
        navigate('/headoffice/dashboard', { replace: true });
      } else if (role === 'branch_engineer') {
        navigate(`/${branch}/engineer/dashboard`, { replace: true });
      } else {
        navigate(`/${branch}/director/dashboard`, { replace: true });
      }
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'USER_NOT_FOUND') {
        setError('No account found with that ID.');
      } else if (code === 'INVALID_PASSWORD') {
        setError('Incorrect password. Please try again.');
      } else if (code === 'MISSING_CREDENTIALS') {
        setError('Please enter both ID and password.');
      } else {
        setError('Login failed. Please try again.');
        console.error('Login error:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = "HEAD OFFICE";

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-6 antialiased font-sans bg-slate-900"
    >
      {/* Looping civil engineering video background */}
      <video
        className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=1920&q=80&fm=jpg&fit=max"
      >
        <source src="https://videos.pexels.com/video-files/34989053/14823639_2560_1440_60fps.mp4" type="video/mp4" />
      </video>

      {/* Brand accent glow + navy vignette — the golden haze is soft on its own, so this adds a brand-blue accent plus enough depth to keep the card crisp */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 90% 8%, rgba(144,213,255,.25) 0%, rgba(144,213,255,0) 40%), radial-gradient(ellipse at center, rgba(15,23,42,0) 30%, rgba(9,14,28,.5) 100%)' }}
      />

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

        {/* Brand Icon & Premium Header Layout Block */}
        <div className="flex items-center gap-5 mb-8">
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-2xl bg-[#90D5FF]/20 border border-[#90D5FF]/50 text-[#006EB1] shadow-sm select-none"
          >
            <Building2 size={26} strokeWidth={2} />
          </motion.div>

          <div>
            <motion.h2
              variants={titleContainerVariants}
              initial="hidden"
              animate="visible"
              className="text-3xl font-black tracking-tight text-[#002B49] uppercase flex items-center select-none"
            >
              {pageTitle.split("").map((char, index) => (
                <motion.span key={index} variants={letterVariants}>
                  {char === " " ? " " : char}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-slate-600 text-sm font-medium">
              Secure Administrative Access
            </motion.p>
          </div>
        </div>

        {/* Authorization Form Segment */}
        <form onSubmit={handleLogin} className="space-y-5 relative z-20">

          {/* Head Office ID Controlled Core Input Field Container */}
          <motion.div variants={itemVariants} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006EB1]/70">
              <User size={18} />
            </span>
            <input
              type="text"
              placeholder="Head Office ID"
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

          {/* Inline error banner on bad credentials */}
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
          SECURE ADMINISTRATIVE NODE
        </motion.div>
      </motion.div>
    </div>
  );
}
