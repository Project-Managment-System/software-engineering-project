import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HardHat, ShieldCheck } from 'lucide-react'; 
import axios from 'axios';

const EngineerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passkey, setPasskey] = useState('');
  const [statusText, setStatusText] = useState('Initializing Core-Link...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animated status messages for Engineers
  useEffect(() => {
    const messages = [
      "Initializing Core-Link...", 
      "Syncing Engineering-OS...", 
      "Hardware Encryption: SECURE"
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      if (!isSubmitting) setStatusText(messages[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusText("Verifying Engineering Credentials...");

    try {
      // Note: Ensure your backend endpoint is configured for engineers if needed
      const res = await axios.post("http://127.0.0.1:5000/api/auth/login", {
      email: email,
      password: passkey
      });

      localStorage.setItem('engineer', JSON.stringify(res.data));
      setStatusText("ACCESS GRANTED. Opening Schematic Console...");

      setTimeout(() => {
        navigate('/engineer/dashboard');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.error || "MAINTENANCE_REQUIRED";
      setStatusText(`CRITICAL_ERROR: ${errorMsg}`);
      alert(`Access Denied: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen w-full bg-[#0d0d08] flex items-center justify-center p-4 overflow-y-auto font-sans text-white">
      
      {/* BACKGROUND DECORATION - Changed to Amber/Gold Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 group flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all duration-300"
      >
        <ArrowLeft size={16} className="text-amber-500 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-amber-400">
          Exit_to_Mainframe
        </span>
      </button>

      <div className="relative w-full max-w-[460px] bg-[#16140c]/95 backdrop-blur-xl rounded-[40px] p-10 border border-amber-500/10 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
        
        {/* Top Accent Line - Golden Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[40px] animate-pulse bg-gradient-to-r from-amber-700 via-yellow-400 to-transparent" />

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 bg-[#1c1a10] rounded-3xl flex items-center justify-center mb-6 border border-amber-500/20 shadow-inner overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent h-1/2 w-full animate-scan pointer-events-none" />
             <HardHat className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-amber-500/80 text-[10px] font-bold tracking-[0.4em] uppercase mb-2">Technical Command V9.0</h2>
          <h1 className="text-white text-3xl font-bold tracking-tight">Engineering Auth</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group space-y-2">
            <label className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] block ml-1">Registry Email</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eng_id@cems-ops.net"
              className="w-full bg-[#1e1c14] border border-white/5 p-4 text-amber-50 placeholder-gray-700 focus:outline-none focus:border-amber-500/50 transition-all rounded-2xl"
            />
          </div>

          <div className="group space-y-2">
            <label className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] block ml-1">Security Keyphrase</label>
            <input 
              required
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1e1c14] border border-white/5 p-4 text-amber-50 placeholder-gray-700 focus:outline-none focus:border-amber-500/50 transition-all rounded-2xl"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 rounded-2xl text-black font-black text-lg uppercase tracking-[0.2em] transition-all bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 shadow-amber-900/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? 'Validating...' : 'Synchronize'} 
            <span className={`${isSubmitting ? 'animate-spin' : 'animate-spin-slow'} text-xl`}>⚙</span>
          </button>

          {/* Dynamic Console Log - Amber Text */}
          <div className="bg-black/80 rounded-2xl p-4 border border-amber-900/30 backdrop-blur-md">
            <p className="text-amber-400 font-mono text-[11px] flex items-center">
              <span className="mr-2 animate-pulse font-bold">{`#`}</span>
              <span className="opacity-90">{statusText}</span>
            </p>
          </div>
        </form>

        {/* Footer Redirect Link */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-500 text-[11px] font-bold tracking-wider uppercase">
            New Specialist? 
            <button 
              type="button"
              onClick={() => navigate('/engineer/register')} 
              className="text-amber-500 hover:text-amber-300 ml-2 transition-colors focus:outline-none underline-offset-4 hover:underline"
            >
              Request Credentials
            </button>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }
        .animate-scan { animation: scan 4s linear infinite; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default EngineerLogin;