import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; 
import axios from 'axios';

// Added isDark prop to match your App.js routing
const UserLogin = ({ isDark }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passkey, setPasskey] = useState('');
  const [statusText, setStatusText] = useState('Initializing handshake...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animated status messages
  useEffect(() => {
    const messages = ["Initializing handshake...", "Syncing with CEMS-OS...", "Encryption layers: ACTIVE"];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      if (!isSubmitting) setStatusText(messages[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isSubmitting]);

  // Handle the actual Login Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusText("Authenticating credentials...");

    try {
      // Ensure your backend is running on port 5000
      const res = await axios.post("http://127.0.0.1:5000/api/auth/login", {
        email: email,
        password: passkey
      });

      // Saving user data for session management
      localStorage.setItem('user', JSON.stringify(res.data));
      setStatusText("ACCESS GRANTED. Redirecting...");

      // The key redirect to your hand-drawn dashboard
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.error || "CONNECTION_FAILURE";
      setStatusText(`ERROR: ${errorMsg}`);
      // Using statusText instead of alert for a cleaner 'hacker' feel
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen w-full bg-[#0a0a14] flex items-center justify-center p-4 overflow-y-auto font-sans text-white">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* BACK TO PORTAL BUTTON */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 group flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300"
      >
        <ArrowLeft size={16} className="text-cyan-500 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-cyan-400">
          Exit_to_Portal
        </span>
      </button>

      <div className="relative w-full max-w-[460px] bg-[#0f0f1e]/90 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[40px] animate-pulse bg-gradient-to-r from-purple-600 via-cyan-400 to-transparent" />

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 bg-[#16162a] rounded-3xl flex items-center justify-center mb-6 border border-cyan-500/20 shadow-inner overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-1/2 w-full animate-scan pointer-events-none" />
              <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.268 0 2.39.246 3.41.679M12 11a10.008 10.008 0 003.73 8.031" />
              </svg>
          </div>
          <h2 className="text-cyan-400 text-[10px] font-bold tracking-[0.4em] uppercase mb-2 opacity-80">CEMS Security Protocol V4.2</h2>
          <h1 className="text-white text-3xl font-bold tracking-tight">Field Identity</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group space-y-2">
            <label className="text-purple-500 text-[10px] font-black uppercase tracking-[0.2em] block ml-1">Operational Email</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff_id@cems-os.net"
              className="w-full bg-[#1a1a2e] border border-white/5 p-4 text-gray-200 placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 transition-all rounded-2xl"
            />
          </div>

          <div className="group space-y-2">
            <label className="text-purple-500 text-[10px] font-black uppercase tracking-[0.2em] block ml-1">Access Passkey</label>
            <input 
              required
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1a1a2e] border border-white/5 p-4 text-gray-200 placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 transition-all rounded-2xl"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 rounded-2xl text-white font-bold text-lg uppercase tracking-[0.2em] transition-all bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500 shadow-purple-900/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? 'Verifying...' : 'Establish Sync'} 
            <span className={`${isSubmitting ? 'animate-spin' : 'animate-spin-slow'} text-xl`}>↻</span>
          </button>

          {/* Dynamic Console Log */}
          <div className="bg-black/60 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
            <p className="text-[#39ff14] font-mono text-[11px] flex items-center">
              <span className="mr-2 animate-pulse font-bold">{`>`}</span>
              <span className="opacity-90">{statusText}</span>
            </p>
          </div>
        </form>

        {/* Footer Redirect Link */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-500 text-[11px] font-bold tracking-wider uppercase">
            Unregistered Personnel? 
            <button 
              type="button"
              onClick={() => navigate('/user/register')} 
              className="text-cyan-500 hover:text-cyan-300 ml-2 transition-colors focus:outline-none underline-offset-4 hover:underline"
            >
              Request Clearance
            </button>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }
        .animate-scan { animation: scan 3s linear infinite; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
      `}} />
    </div>
  );
};

export default UserLogin;