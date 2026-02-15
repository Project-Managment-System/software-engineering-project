import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, Globe, Activity, HardHat, 
  BarChart3, Terminal, Lock, Shield, Cpu, 
  Zap, Navigation, Layers, Fingerprint 
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

// --- Utility: Animated Counter Hook ---
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

// --- Sub-component: StatBox ---
const StatBox = ({ icon: Icon, label, value, isDark, color = "" }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative group p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-500 overflow-hidden ${
      isDark 
        ? 'bg-slate-900/40 border-white/5 hover:border-cyan-500/30' 
        : 'bg-white/80 border-slate-200 shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/40'
    }`}
  >
    {/* PATTERN: Glows are replaced with subtle "tinted glass" in light mode */}
    <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
    
    <Icon size={20} className={`${isDark ? 'text-cyan-500' : 'text-cyan-600'} group-hover:animate-pulse`} />
    
    <span className={`text-[10px] uppercase tracking-[3px] font-bold text-center ${isDark ? 'opacity-40' : 'opacity-60 text-slate-500'}`}>
      {label}
    </span>
    
    <span className={`text-sm font-mono font-black tracking-tighter ${color || (isDark ? 'text-white' : 'text-slate-900')}`}>
      {value}
    </span>
    
    <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-500 group-hover:w-full transition-all duration-500`} />
  </motion.div>
);

const Header = ({ isDark, setIsDark }) => {
  const { scrollY } = useScroll();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const smoothY = useSpring(scrollY, { stiffness: 100, damping: 30 });
  
  const headerOpacity = useTransform(smoothY, [0, 400], [1, 0]);
  const headerScale = useTransform(smoothY, [0, 400], [1, 0.9]);
  const headerRotate = useTransform(smoothY, [0, 400], [0, 2]);
  
  // PATTERN: Stronger backdrop blur for light mode to prevent content bleed
  const navBackground = useTransform(
    smoothY, 
    [0, 80], 
    isDark 
      ? ["rgba(1, 4, 9, 0)", "rgba(1, 4, 9, 0.9)"] 
      : ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.85)"]
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
      {/* 1. ADVANCED NAVIGATION BAR */}
      <motion.nav 
        style={{ backgroundColor: navBackground }}
        className={`fixed top-0 w-full z-[100] px-10 py-5 flex items-center justify-between border-b transition-all duration-700 ${
          isDark 
            ? 'border-white/5 backdrop-blur-xl' 
            : 'border-slate-200 backdrop-blur-md shadow-sm'
        }`}
      >
        <div className="flex items-center gap-12">
          <div className="group cursor-pointer flex items-center gap-4">
            <div className="relative">
                <Layers className={`${isDark ? 'text-cyan-500' : 'text-cyan-600'} group-hover:rotate-180 transition-transform duration-700`} size={24} />
                <div className={`absolute -inset-2 blur-lg rounded-full animate-pulse ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-600/10'}`} />
            </div>
            <div>
                <h2 className={`text-2xl font-black tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  CivilPro <span className="text-cyan-600 italic">Max</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[7px] font-mono tracking-[4px] uppercase font-bold ${isDark ? 'text-cyan-400 opacity-60' : 'text-cyan-600 opacity-80'}`}>
                    Uplink_Established
                  </span>
                </div>
            </div>
          </div>

          <div className={`hidden xl:flex items-center gap-8 border-l pl-10 font-mono text-[9px] tracking-[4px] ${
              isDark ? 'border-white/10 opacity-40' : 'border-slate-200 text-slate-500'
            }`}>
            <span className="flex items-center gap-2 hover:opacity-100 transition-opacity"><Globe size={12} className="text-blue-500"/> GS-NORTH_STATION</span>
            <span className="flex items-center gap-2 hover:opacity-100 transition-opacity"><Navigation size={12} className="text-cyan-500"/> LAT: 40.7128° N</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`hidden md:flex flex-col items-end px-4 py-1.5 border-r pr-6 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <span className={`text-[8px] font-mono uppercase tracking-widest ${isDark ? 'opacity-40' : 'text-slate-400 font-bold'}`}>Neural_Sync</span>
            <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-1 w-3 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                </div>
                <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>100%</span>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDark(!isDark)} 
            className={`p-3 rounded-2xl transition-all duration-500 ${
              isDark ? 'bg-white/5 text-yellow-400 border border-white/10' : 'bg-slate-100 text-slate-600 border border-slate-300 shadow-inner'
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* 2. ENHANCED HERO SECTION */}
      <motion.header 
        style={{ opacity: headerOpacity, scale: headerScale, rotateX: headerRotate }}
        className="pt-56 pb-20 px-6 text-center max-w-7xl mx-auto relative z-10 perspective-1000"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className={`group mb-8 px-6 py-2 rounded-full border text-[10px] font-mono tracking-[5px] uppercase relative overflow-hidden ${
            isDark ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' : 'border-slate-300 text-slate-600 bg-slate-50 shadow-sm'
          }`}>
            <motion.div 
                className="absolute inset-0 bg-cyan-500/10"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10 flex items-center gap-3">
                <Fingerprint size={12} className={isDark ? "animate-pulse" : "text-cyan-600"} /> Command_Override_Enabled
            </span>
          </div>
          
          <h1 className="text-8xl md:text-[160px] font-black flex flex-col leading-[0.75] tracking-tighter select-none">
            <span className={`${isDark ? "text-white" : "text-slate-900"} ${isDark ? "drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" : ""}`}>
              COMMAND
            </span>
            <span className="bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 bg-clip-text text-transparent py-6">
              CENTRAL
            </span>
          </h1>

          <p className={`mt-8 max-w-xl text-xs font-mono tracking-[4px] uppercase leading-relaxed ${isDark ? 'opacity-40 text-slate-300' : 'text-slate-500'}`}>
            Next-Gen Infrastructure Orchestration // Phase 4 Deployment
          </p>
        </motion.div>
      </motion.header>

      {/* 3. INTERACTIVE HUD STATUS BOARD */}
      <section className="relative z-20 mb-40 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            style={{ rotateX: mousePos.y * 0.5, rotateY: mousePos.x * 0.5 }}
            className="relative group transition-transform duration-200 ease-out"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <div className={`relative flex flex-col md:flex-row items-center justify-between gap-10 p-10 rounded-[40px] border backdrop-blur-3xl transition-all duration-700 ${
              isDark 
                ? 'bg-slate-900/60 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]' 
                : 'bg-white/90 border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)]'
            }`}>
              <div className="flex items-center gap-8">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className={`p-6 rounded-3xl ${isDark ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' : 'bg-slate-50 text-cyan-600 border-slate-200 shadow-inner'} border shadow-[0_0_40px_rgba(6,182,212,0.15)]`}
                >
                  <HardHat size={40} />
                </motion.div>
                <div className="space-y-2">
                  <h2 className={`text-3xl font-black tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Civil <span className="text-cyan-600">Pro</span> Max
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[9px] font-mono font-bold rounded-lg border ${
                      isDark ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    }`}>v2.6.0_STABLE</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-mono opacity-50 uppercase tracking-widest"><Zap size={10} className="text-yellow-500" /> Latency: 0.4ms</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className={`px-6 py-3 rounded-2xl border font-mono text-[11px] font-black tracking-widest ${
                  isDark ? 'bg-black/60 border-white/10 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}>
                  CORE_ID: <span className={`${isDark ? 'text-cyan-500' : 'text-cyan-600'} animate-pulse`}>CMS_X_99</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`h-1 w-24 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 2 }}
                            className="h-full bg-cyan-500"
                        />
                    </div>
                    <span className={`text-[8px] font-mono opacity-40 uppercase`}>HW_INTEGRITY</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            <StatBox icon={Activity} label="Global Deployment" value={projects.toLocaleString()} isDark={isDark} />
            <StatBox icon={BarChart3} label="Data Sync Index" value={`${resourceSync}%`} isDark={isDark} />
            <StatBox icon={Globe} label="Neural Relay" value="ACTIVE" isDark={isDark} color="text-green-600" />
            <StatBox icon={Lock} label="Shield Protocol" value="LVL_OMEGA" isDark={isDark} />
          </div>

          {/* DYNAMIC LOG MARQUEE */}
          <div className={`mt-10 overflow-hidden rounded-2xl border py-4 flex items-center gap-8 px-8 font-mono text-[11px] backdrop-blur-md ${
            isDark ? 'bg-black/40 border-white/5 text-cyan-500/60' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <span className={`flex items-center gap-3 font-black shrink-0 uppercase tracking-widest border-r pr-8 ${isDark ? 'text-cyan-500 border-white/10' : 'text-cyan-700 border-slate-200'}`}>
              <Terminal size={16} /> Live_Telemetry
            </span>
            <div className="flex gap-16 whitespace-nowrap animate-marquee italic opacity-80">
              <span>{`> [RECV] SATELLITE_UPLINK_SUCCESS_SECTOR_A1`}</span>
              <span>{`> [SYNC] THERMAL_SCAN_COMPLETE_STABILITY_100%`}</span>
              <span>{`> [DB] REFRESHING_RESOURCE_REGISTRY_0.02s`}</span>
              <span>{`> [SEC] NEURAL_HANDSHAKE_VERIFIED_ADMIN_LEVEL`}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Header;