import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Lock } from 'lucide-react'; 
import axios from 'axios';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passkey, setPasskey] = useState('');
  const [statusText, setStatusText] = useState('Awaiting Admin Override...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const messages = ["Awaiting Admin Override...", "Bypassing Standard Protocols...", "Root Access: PENDING"];
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
    setStatusText("Executing Root Authentication...");
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/auth/admin-login", {
        email: email,
        password: passkey
      });
      localStorage.setItem('admin_token', JSON.stringify(res.data));
      setStatusText("ROOT ACCESS GRANTED. Welcome, Overseer.");
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "AUTHORIZATION_DENIED";
      setStatusText(`CRITICAL_FAILURE: ${errorMsg}`);
      alert(`System Lockdown: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen w-full bg-[#0a0505] flex items-center justify-center p-4 overflow-hidden font-sans text-white">
      
      {/* GRID BACKGROUND 
          Matches the reference image: Dark, thin lines forming small squares.
      */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, #ff0000 1px, transparent 1px),
              linear-gradient(to bottom, #ff0000 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px' // Adjust this to change the size of the squares
          }} 
        />
        {/* Subtle radial overlay to make the center focus cleaner */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0505_90%)]" />
      </div>

      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 group flex items-center gap-3 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/40 transition-all duration-300 z-50"
      >
        <ArrowLeft size={16} className="text-red-500 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-red-400">
          Terminate_Session
        </span>
      </button>

      <div className="relative w-full max-w-[460px] bg-[#120808]/95 backdrop-blur-2xl rounded-[40px] p-10 border border-red-500/20 shadow-[0_0_80px_rgba(220,38,38,0.15)] z-10">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[40px] animate-pulse bg-gradient-to-r from-red-900 via-red-500 to-transparent" />

        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 bg-[#1a0a0a] rounded-3xl flex items-center justify-center mb-6 border border-red-500/30 shadow-inner overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/30 to-transparent h-1/2 w-full animate-scan pointer-events-none" />
             <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-red-500 text-[10px] font-bold tracking-[0.5em] uppercase mb-2 opacity-80">Security Level: Omega</h2>
          <h1 className="text-white text-3xl font-black tracking-tighter">CORE ADMIN</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group space-y-2">
            <label className="text-red-700 text-[10px] font-black uppercase tracking-[0.2em] block ml-1">Admin Identifier</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="root@cems-os.internal"
              className="w-full bg-[#1a0c0c] border border-red-500/10 p-4 text-red-100 placeholder-red-900/50 focus:outline-none focus:border-red-500/50 transition-all rounded-2xl font-mono"
            />
          </div>

          <div className="group space-y-2">
            <label className="text-red-700 text-[10px] font-black uppercase tracking-[0.2em] block ml-1">Override Code</label>
            <input 
              required
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1a0c0c] border border-red-500/10 p-4 text-red-100 placeholder-red-900/50 focus:outline-none focus:border-red-500/50 transition-all rounded-2xl"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 rounded-2xl text-white font-black text-lg uppercase tracking-[0.2em] transition-all bg-gradient-to-r from-red-800 via-red-600 to-red-700 shadow-[0_10px_20px_rgba(185,28,28,0.2)] hover:shadow-red-500/30 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? 'OVERRIDING...' : 'INITIALIZE LOGIN'} 
            <Lock className={`${isSubmitting ? 'animate-bounce' : ''} w-5 h-5`} />
          </button>

          <div className="bg-black/90 rounded-2xl p-4 border border-red-950 shadow-inner">
            <p className="text-red-500 font-mono text-[11px] flex items-center">
              <span className="mr-2 animate-pulse font-bold">{`!!`}</span>
              <span className="opacity-90 uppercase">{statusText}</span>
            </p>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-red-500/10 pt-6 space-y-3">
          <p className="text-gray-500 text-[11px] font-bold tracking-wider uppercase">
            New Specialist? 
            <button 
              type="button"
              onClick={() => navigate('/admin/register')} 
              className="text-red-500 hover:text-red-400 ml-2 transition-colors focus:outline-none underline-offset-4 hover:underline"
            >
              Request Credentials
            </button>
          </p>
          <p className="text-red-900/40 text-[9px] font-bold tracking-[0.3em] uppercase">
            Unauthorized Access is a Federal Offense
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }
        .animate-scan { animation: scan 2s linear infinite; }
      `}} />
    </div>
  );
};

export default AdminLogin;