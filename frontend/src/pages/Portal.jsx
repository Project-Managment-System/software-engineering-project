import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Cpu, Fingerprint, Users, Sun, Moon, Activity, Globe, Lock, HardHat, BarChart3 
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Added for routing
import './Portal.css';

// --- Enhanced Sub-Component: Particle Background ---
const ParticleField = ({ isDark }) => {
  const particles = useMemo(() => [...Array(30)].map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${isDark ? 'bg-cyan-500' : 'bg-blue-400'}`}
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
};

// --- PortalCard Component ---
const PortalCard = ({ title, desc, icon: Icon, level, stats, primaryAction, secondaryAction, onPrimary, onSecondary, bgImage, isDark }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -12 }}
    className={`portal-card group ${isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white border-slate-200 shadow-2xl'}`}
  >
    <div className="card-image-wrapper">
      <img src={bgImage} alt={title} className="card-bg-image transition-transform duration-1000 group-hover:scale-110" />
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-slate-950 via-slate-950/80' : 'bg-gradient-to-t from-white via-white/80'} to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-700`} />
    </div>

    <div className="relative z-10 p-8 flex flex-col h-full">
      <div className="flex justify-between items-start mb-8">
        <div className={`p-5 rounded-2xl border backdrop-blur-xl shadow-2xl group-hover:border-cyan-400/50 transition-all duration-500 ${isDark ? 'bg-slate-800/40 border-white/10' : 'bg-white border-slate-200'}`}>
          <Icon className={isDark ? "text-cyan-400" : "text-cyan-600"} size={36} />
        </div>
        <div className="text-right">
          <span className={`block text-[10px] font-mono tracking-[4px] uppercase ${isDark ? 'text-cyan-400' : 'text-cyan-700 font-bold'}`}>{level}</span>
          <span className={`flex items-center justify-end gap-1.5 text-[8px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-900 font-bold'}`}>
            <Lock size={8} /> ENCRYPTION: ACTIVE
          </span>
        </div>
      </div>

      <h3 className={`text-3xl font-black mb-3 tracking-tight group-hover:text-cyan-500 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-950'}`}>{title}</h3>
      <p className={`text-sm mb-8 leading-relaxed h-12 italic ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>"{desc}"</p>
      
      <div className="space-y-2 mb-10 flex-grow">
        {stats.map((s, idx) => (
          <div key={idx} className={`flex items-center justify-between border px-4 py-2 rounded-xl text-[10px] font-mono transition-colors ${isDark ? 'bg-black/40 border-white/5 group-hover:border-cyan-500/20' : 'bg-slate-100 border-slate-200'}`}>
            <span className={`${isDark ? 'opacity-50' : 'text-slate-500'}`}>{s.label}</span>
            <span className={s.highlight ? "text-cyan-500 font-bold" : (isDark ? "text-white" : "text-slate-950 font-bold")}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button onClick={onPrimary} className="relative overflow-hidden py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-xs uppercase tracking-[3px] transition-all active:scale-95 shadow-[0_0_20px_rgba(8,145,178,0.3)]">
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Fingerprint size={18} /> {primaryAction}
          </span>
          <motion.div className="absolute inset-0 bg-white/20" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.6 }} />
        </button>
        <button onClick={onSecondary} className={`py-4 border rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-cyan-500/5 transition-all duration-300 ${isDark ? 'border-white/10 text-white' : 'border-slate-300 text-slate-900'}`}>
          {secondaryAction}
        </button>
      </div>
    </div>
  </motion.div>
);

// --- Main Portal Component ---
export default function Portal() {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [isDark, setIsDark] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Navigation handler with integrated scanning animation
  const handlePortalNavigation = (targetPath) => {
    setIsScanning(true);
    setTimeout(() => { 
      setIsScanning(false); 
      navigate(targetPath); // Navigates to the route defined in App.jsx
    }, 2200);
  };

  return (
    <div className={`portal-container min-h-screen selection:bg-cyan-500/30 ${isDark ? 'bg-[#010409] text-slate-100' : 'bg-slate-50 text-slate-950'}`}>
      
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 z-[110] origin-left" style={{ scaleX }} />
      
      <ParticleField isDark={isDark} />

      <div className="portal-bg-fx">
        <div className={`absolute inset-0 ${isDark ? 'dark-gradient' : 'bg-slate-50'}`} />
        {isDark && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />}
      </div>

      <nav className={`portal-nav fixed w-full z-[100] px-10 py-6 flex items-center justify-between border-b transition-all duration-500 ${isDark ? 'bg-black/60 border-white/5 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'}`}>
        <div className="flex items-center gap-6 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="relative">
            <div className="absolute -inset-2 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="relative text-2xl font-black tracking-tighter uppercase leading-none">
              CivilPro <span className="text-cyan-500 underline decoration-2 underline-offset-4">Max</span>
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex gap-6 font-mono text-[10px] tracking-widest opacity-60">
            <span className="flex items-center gap-2"><Globe size={12}/> GS-NORTH_STATION</span>
            <span className="flex items-center gap-2"><Activity size={12}/> SYSTEM_STABLE</span>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)} 
            className={`p-3 rounded-xl transition-all duration-300 transform active:scale-90 ${isDark ? 'bg-white/5 hover:bg-white/10 text-yellow-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className={`scan-overlay fixed inset-0 z-[200] flex flex-col items-center justify-center ${isDark ? 'bg-black/95' : 'bg-white/95'}`}
          >
            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
                className="w-64 h-64 border-t-2 border-b-2 border-cyan-500 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.3)]" 
              />
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute"
              >
                <Fingerprint size={80} className="text-cyan-500 opacity-80" />
              </motion.div>
            </div>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-12 text-cyan-500 font-mono font-bold tracking-[12px] text-xs uppercase animate-pulse"
            >
              Analyzing Neural Signature
            </motion.p>
          </motion.div>
        )}

        <motion.div 
          key="portal-content" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="relative z-10"
        >
          {/* Header Section */}
          <header className="pt-52 pb-12 px-6 text-center max-w-5xl mx-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className={`mb-6 px-4 py-1 rounded-full border text-[10px] font-mono tracking-[3px] ${isDark ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : 'border-slate-300 text-slate-600'}`}>
                AUTHORIZED PERSONNEL ONLY
              </div>
              <h1 className="text-7xl md:text-9xl font-black flex flex-col leading-[0.85] tracking-tighter">
                <span className={isDark ? "text-white" : "text-slate-900"}>COMMAND</span>
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-fill-transparent py-4">CENTRAL</span>
              </h1>
            </motion.div>
          </header>

          <main className="max-w-[1400px] mx-auto px-10 pb-40 grid grid-cols-1 md:grid-cols-3 gap-10">
            <PortalCard 
              isDark={isDark} icon={ShieldCheck} title="Executive Node" level="Level 000" desc="Absolute fiscal control and audit logs."
              bgImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000"
              stats={[{ label: "System Load", value: "12%" }, { label: "Security", value: "Quantum-Safe", highlight: true }]}
              primaryAction="Neural Login" secondaryAction="Request Access"
              onPrimary={() => handlePortalNavigation('/admin/login')} 
              onSecondary={() => handlePortalNavigation('/admin/register')}
            />
            <PortalCard 
              isDark={isDark} icon={Cpu} title="Engineering Hub" level="Level 001" desc="Real-time structural stress telemetry."
              bgImage="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1000"
              stats={[{ label: "Nodes Connected", value: "4.2k" }, { label: "Data Sync", value: "0.4ms", highlight: true }]}
              primaryAction="Auth Core" secondaryAction="Manual Override"
              onPrimary={() => handlePortalNavigation('/engineer/login')} 
              onSecondary={() => handlePortalNavigation('/engineer/register')}
            />
            <PortalCard 
              isDark={isDark} icon={Users} title="Tactical Ops" level="Level 002" desc="Global field unit coordination protocols."
              bgImage="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1000"
              stats={[{ label: "Active Units", value: "248" }, { label: "Region", value: "Global-Ex", highlight: true }]}
              primaryAction="Sync Uplink" secondaryAction="Archive"
              onPrimary={() => handlePortalNavigation('/user/login')} 
              onSecondary={() => handlePortalNavigation('/user/register')}
            />
          </main>

          <footer className="py-20 text-center border-t border-white/5 opacity-40 font-mono text-[9px] tracking-[5px]">
            &copy; 2026 CIVILPRO MAX MULTIVERSE TERMINAL | ALL RIGHTS RESERVED
          </footer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}