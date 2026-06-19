import React from 'react';
import { Building2, LayoutDashboard, Globe, ChevronRight } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PortalCard = ({ title, icon: Icon, description, onClick, image }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white/50 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col overflow-hidden group hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-500"
  >
    <div className="h-56 w-full overflow-hidden relative">
      <div className="absolute inset-0 bg-blue-900/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover grayscale-[70%] transition-all duration-700 group-hover:grayscale-0 scale-100 group-hover:scale-110"
      />
    </div>

    <div className="p-8 flex flex-col flex-grow">
      <div className="p-4 rounded-3xl bg-blue-100/50 text-blue-600 w-fit mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
        <Icon size={32} strokeWidth={2.5} />
      </div>
      <h3 className="text-3xl font-extrabold mb-3 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 mb-8 flex-grow leading-relaxed">{description}</p>
      <button 
        onClick={onClick} 
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-4"
      >
        ACCESS PORTAL <ChevronRight size={18} />
      </button>
    </div>
  </motion.div>
);

export default function Portal() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 z-[110] origin-left" style={{ scaleX }} />

      <nav className="fixed w-full z-[100] px-10 py-8 flex items-center justify-between bg-white/50 backdrop-blur-lg border-b border-slate-200/50">
        <h2 className="text-2xl font-black tracking-tighter uppercase">CivilPro <span className="text-blue-600">Max</span></h2>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 tracking-widest uppercase">
          <Globe size={16}/> System Operational
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-10 pt-48 pb-20">
        <header className="mb-20 text-center flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-8xl font-black tracking-tighter mb-6"
          >
            COMMAND<br/><span className="text-blue-600">CENTRAL</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-lg mx-auto"
          >
            Streamlined administrative and operational access for the future of civil engineering infrastructure.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <PortalCard 
            icon={Building2} 
            title="Head Office" 
            description="High-level strategic oversight and administrative enterprise management."
            image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
            onClick={() => navigate('/headoffice/login')} 
          />
          <PortalCard 
            icon={LayoutDashboard} 
            title="Division" 
            description="Unified field operations, engineering analytics, and user access."
            image="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200"
            onClick={() => navigate('/division/login')} 
          />
        </div>
      </main>
    </div>
  );
}