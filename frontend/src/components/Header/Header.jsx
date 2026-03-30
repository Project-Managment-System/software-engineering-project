import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Globe, Activity, HardHat, 
  BarChart3, Terminal, Lock, Shield, Cpu, 
  Zap, Navigation, Layers, Fingerprint 
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom'; // Added this

const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

const StatBox = ({ icon: Icon, label, value, isDark, color = "" }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative group p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-500 overflow-hidden ${
      isDark ? 'bg-slate-900/40 border-white/5 hover:border-cyan-500/30' : 'bg-white/80 border-slate-200 shadow-lg hover:shadow-cyan-500/40'
    }`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <Icon size={20} className={`${isDark ? 'text-cyan-500' : 'text-cyan-600'} group-hover:animate-pulse`} />
    <span className={`text-[10px] uppercase tracking-[3px] font-bold text-center ${isDark ? 'opacity-40' : 'opacity-60 text-slate-500'}`}>{label}</span>
    <span className={`text-sm font-mono font-black tracking-tighter ${color || (isDark ? 'text-white' : 'text-slate-900')}`}>{value}</span>
    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-500 group-hover:w-full transition-all duration-500" />
  </motion.div>
);

const Header = ({ isDark, setIsDark }) => {
  const location = useLocation(); // Get current page path
  const isDashboard = location.pathname.includes('dashboard'); // Check if we are in a dashboard

  const { scrollY } = useScroll();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const smoothY = useSpring(scrollY, { stiffness: 100, damping: 30 });
  
  const headerOpacity = useTransform(smoothY, [0, 400], [1, 0]);
  const headerScale = useTransform(smoothY, [0, 400], [1, 0.9]);
  const headerRotate = useTransform(smoothY, [0, 400], [0, 2]);
  
  const navBackground = useTransform(
    smoothY, 
    [0, 80], 
    isDark ? ["rgba(1, 4, 9, 0)", "rgba(1, 4, 9, 0.9)"] : ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.85)"]
  );

  const projects = useCountUp(1248, 2500);
  const resourceSync = useCountUp(94, 3000);

  const handleMouseMove = (e) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative">
      {/* 1. NAVIGATION BAR */}
      <motion.nav 
        style={{ backgroundColor: navBackground }}
        className={`fixed top-0 w-full z-[100] px-10 py-5 flex items-center justify-between border-b transition-all duration-700 ${
          isDark ? 'border-white/5 backdrop-blur-xl' : 'border-slate-200 backdrop-blur-md shadow-sm'
        }`}
      >
        <div className="flex items-center gap-12">
          <div className="group cursor-pointer flex items-center gap-4">
            <Layers className={`${isDark ? 'text-cyan-500' : 'text-cyan-600'} group-hover:rotate-180 transition-transform duration-700`} size={24} />
            <div>
              <h2 className={`text-2xl font-black tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                CivilPro <span className="text-cyan-600 italic">Max</span>
              </h2>
            </div>
          </div>

          {/* HIDE THE STATION INFO ON HOME PAGE */}
          {isDashboard && (
            <div className={`hidden xl:flex items-center gap-8 border-l pl-10 font-mono text-[9px] tracking-[4px] ${isDark ? 'border-white/10 opacity-40' : 'border-slate-200 text-slate-500'}`}>
              <span className="flex items-center gap-2"><Globe size={12} className="text-blue-500"/> GS-NORTH_STATION</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 180 }}
            onClick={() => setIsDark(!isDark)} 
            className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 text-yellow-400' : 'bg-slate-100 text-slate-600 border'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* 2. ONLY SHOW HERO ON HOME PAGE */}
      {location.pathname === '/' && (
        <motion.header 
          style={{ opacity: headerOpacity, scale: headerScale, rotateX: headerRotate }}
          className="pt-56 pb-20 px-6 text-center max-w-7xl mx-auto relative z-10"
        >
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
            <h1 className="text-8xl md:text-[140px] font-black flex flex-col leading-[0.75] tracking-tighter">
              <span className={isDark ? "text-white" : "text-slate-900"}>COMMAND</span>
              <span className="bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 bg-clip-text text-transparent py-6">CENTRAL</span>
            </h1>
            <p className={`mt-8 text-xs font-mono tracking-[4px] uppercase ${isDark ? 'opacity-40 text-slate-300' : 'text-slate-500'}`}>
              Next-Gen Infrastructure Orchestration
            </p>
          </motion.div>
        </motion.header>
      )}

      {/* 3. ONLY SHOW DASHBOARD HUD IF ON DASHBOARD PAGE */}
      {isDashboard && (
        <section className="relative z-20 mb-40 px-6 mt-40">
          <div className="max-w-6xl mx-auto">
            <div className={`relative flex flex-col md:flex-row items-center justify-between gap-10 p-10 rounded-[40px] border backdrop-blur-3xl ${
              isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/90 border-slate-200'
            }`}>
              <div className="flex items-center gap-8">
                <HardHat size={40} className="text-cyan-500" />
                <h2 className={`text-3xl font-black uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Civil <span className="text-cyan-600">Pro</span> Max
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              <StatBox icon={Activity} label="Global Deployment" value={projects.toLocaleString()} isDark={isDark} />
              <StatBox icon={BarChart3} label="Data Sync Index" value={`${resourceSync}%`} isDark={isDark} />
              <StatBox icon={Globe} label="Neural Relay" value="ACTIVE" isDark={isDark} color="text-green-600" />
              <StatBox icon={Lock} label="Shield Protocol" value="LVL_OMEGA" isDark={isDark} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Header;