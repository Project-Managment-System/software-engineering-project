import React from 'react';
import { ShieldCheck, Cpu, Users, Globe } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PortalCard = ({ title, icon: Icon, bgImage, stats, onLogin, onRegister }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl flex flex-col h-full group"
  >
    <div className="h-48 w-full overflow-hidden">
      <img 
        src={bgImage} 
        alt={title} 
        className="w-full h-full object-cover transition-all duration-700 grayscale-[100%] group-hover:grayscale-0 scale-100 group-hover:scale-105"
      />
    </div>

    <div className="p-8 flex flex-col flex-grow">
      <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 w-fit mb-6">
        <Icon size={40} />
      </div>

      {/* Title font increased */}
      <h3 className="text-3xl font-bold mb-6 text-slate-900">{title}</h3>
      
      <div className="space-y-4 mb-8 flex-grow">
        {stats.map((s, idx) => (
          <div key={idx} className="flex justify-between text-base py-2 border-b border-slate-100">
            <span className="text-slate-500">{s.label}</span>
            <span className={`font-semibold ${s.value === "Active" ? "text-green-600" : "text-slate-900"}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button onClick={onLogin} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
          LOGIN
        </button>
        <button onClick={onRegister} className="w-full py-4 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">
          REGISTER
        </button>
      </div>
    </div>
  </motion.div>
);

export default function Portal() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[110] origin-left" style={{ scaleX }} />

      <nav className="fixed w-full z-[100] px-10 py-6 flex items-center justify-between bg-white/80 border-b border-slate-200 backdrop-blur-md">
        <h2 className="text-3xl font-black uppercase">CivilPro <span className="text-blue-600">Max</span></h2>
        <div className="flex items-center gap-4 text-base font-medium text-slate-500">
          <Globe size={20}/> SYSTEM OPERATIONAL
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-10 pt-40 pb-20">
        <header className="mb-20 text-center">
          {/* Header font increased */}
          <h1 className="text-8xl font-black mb-6">COMMAND CENTRAL</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PortalCard 
            icon={ShieldCheck} 
            title="Admin Hub" 
            bgImage="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
            stats={[{label: "Role", value: "Executive/Monitor"}, {label: "Status", value: "Active"}]} 
            onLogin={() => navigate('/admin/login')} 
            onRegister={() => navigate('/admin/register')} 
          />
          
          <PortalCard 
            icon={Cpu} 
            title="Engineering Hub" 
            bgImage="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800"
            stats={[{label: "Role", value: "Technical Head"}, {label: "Status", value: "Active"}]} 
            onLogin={() => navigate('/engineer/login')} 
            onRegister={() => navigate('/engineer/register')} 
          />
          
          <PortalCard 
            icon={Users} 
            title="User Hub" 
            bgImage="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800"
            stats={[{label: "Role", value: "Field Worker"}, {label: "Status", value: "Active"}]} 
            onLogin={() => navigate('/user/login')} 
            onRegister={() => navigate('/user/register')} 
          />
        </div>
      </main>
    </div>
  );
}