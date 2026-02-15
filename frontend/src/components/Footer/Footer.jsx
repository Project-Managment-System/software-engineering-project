import React, { useState, useEffect } from 'react';
import { 
  Shield, Terminal, Cpu, Mail, Github, Linkedin, 
  MessageSquare, Radio, Globe, Zap, Fingerprint, ChevronUp,
  Server, Activity, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Footer.css';

export default function Footer({ isDark }) {
  const currentYear = new Date().getFullYear();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [ping, setPing] = useState(24);

  // Simulate live network latency
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * (32 - 18 + 1) + 18));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const connections = [
    { id: 'github', icon: Github, label: 'SOURCE_CODE', link: 'https://github.com/your-repo' },
    { id: 'linkedin', icon: Linkedin, label: 'CORP_LINK', link: 'https://linkedin.com/in/your-profile' },
    { id: 'mail', icon: Mail, label: 'SECURE_MSG', link: 'mailto:contact@civilpromax.com' },
    { id: 'discord', icon: MessageSquare, label: 'COMMS_HUB', link: 'https://discord.gg/your-invite' }
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className={`relative border-t overflow-hidden transition-all duration-700 ${
      isDark ? 'bg-[#010409] border-white/5' : 'bg-slate-50 border-slate-200'
    }`}>
      
      {/* Background Decorative Element */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent ${isDark ? 'opacity-50' : 'opacity-20'}`} />

      <div className="w-full px-8 pt-20 pb-12">
        {/* Main Content Row - Changed to Flex for "Fill" effect */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          
          {/* Section 1: Terminal Context (Far Left) */}
          <div className="space-y-6 min-w-[250px]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                <Terminal size={18} className="text-cyan-500" />
              </div>
              <h3 className="font-mono text-[10px] font-black tracking-[4px] uppercase opacity-80">
                Terminal_Info
              </h3>
            </div>
            
            <div className="space-y-4 font-mono text-[10px] tracking-widest opacity-50">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                SESSION: <span className={isDark ? 'text-white' : 'text-slate-900'}>0x8291A-PRIME</span>
              </div>
              <div className="flex items-center gap-3">
                <Radio size={12} className="text-green-500" />
                LATENCY: <span className={isDark ? 'text-white' : 'text-slate-900'}>{ping}ms</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={12} className="text-blue-500" />
                REGION: <span className={isDark ? 'text-white' : 'text-slate-900'}>GLOBAL_NODES</span>
              </div>
            </div>
          </div>

          {/* Section 2: Middle - Branding & Topology (Center Expansion) */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 px-4 border-x border-white/5">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="cursor-default text-center"
            >
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-none mb-2">
                CivilPro <span className="text-cyan-500">Max</span>
              </h2>
              <p className="text-[9px] font-mono tracking-[4px] opacity-40 uppercase">
                &copy; {currentYear} System Integrity
              </p>
            </motion.div>

            {/* Interactive Links Grid */}
            <div className="flex gap-4 p-2 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
              {connections.map((conn) => (
                <div key={conn.id} className="relative">
                  <motion.a
                    href={conn.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredLink(conn.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    whileHover={{ y: -5, backgroundColor: 'rgba(8, 145, 178, 0.1)' }}
                    className={`block p-3 rounded-xl transition-colors ${
                      isDark ? 'text-slate-400 border-white/5 hover:text-cyan-400' : 'text-slate-600 border-slate-200 hover:text-cyan-600'
                    }`}
                  >
                    <conn.icon size={20} />
                  </motion.a>
                  
                  <AnimatePresence>
                    {hoveredLink === conn.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-600 text-[8px] font-mono text-white rounded whitespace-nowrap z-50 shadow-lg shadow-cyan-900/40"
                      >
                        {conn.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Center Visual Filler: Topology Map (New) */}
            <div className="hidden lg:flex items-center gap-8 opacity-20 font-mono text-[7px] tracking-[2px]">
                <span className="flex items-center gap-2"><Server size={10}/> NODE_01: ONLINE</span>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                <span className="flex items-center gap-2"><Activity size={10}/> CORE: STABLE</span>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                <span className="flex items-center gap-2"><Share2 size={10}/> RELAY: ACTIVE</span>
            </div>
          </div>

          {/* Section 3: Integrity Shield (Far Right) */}
          <div className="flex flex-col items-end space-y-6 min-w-[250px]">
            <div className={`p-4 rounded-2xl border text-right space-y-2 group transition-all duration-500 ${
              isDark ? 'bg-black/40 border-white/5 hover:border-cyan-500/20' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="flex items-center justify-end gap-3">
                <span className="text-[9px] font-mono tracking-widest opacity-40 uppercase">Protection_Active</span>
                <Shield size={16} className="text-cyan-500" />
              </div>
              <div className="flex items-center justify-end gap-2 text-[10px] font-mono font-black">
                <Zap size={10} className="text-yellow-500" />
                QUANTUM_SHIELD v4.2
              </div>
            </div>

            <button 
              onClick={scrollToTop}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl font-mono text-[9px] tracking-widest uppercase transition-all ${
                isDark ? 'hover:bg-white/5 text-slate-500 hover:text-white' : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              Back_to_Top <ChevronUp size={14} />
            </button>
          </div>
        </div>

        {/* Lower Security Bar - Full width row */}
        <div className={`mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6 ${
          isDark ? 'border-white/5' : 'border-slate-200'
        }`}>
          <div className="flex gap-8 text-[7px] font-mono opacity-30 tracking-[4px] uppercase">
            <span className="flex items-center gap-2"><Fingerprint size={10} /> Neural_Handshake: OK</span>
            <span className="flex items-center gap-2 font-black text-cyan-500">Access: Level_Admin</span>
          </div>
          
          <div className="flex gap-6 text-[8px] font-mono opacity-40 tracking-widest">
            <a href="/legal" className="hover:text-cyan-400 transition-colors">Privacy_Protocol</a>
            <a href="/security" className="hover:text-cyan-400 transition-colors">Security_Log</a>
            <a href="/terms" className="hover:text-cyan-400 transition-colors">Usage_Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}