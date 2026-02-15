import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  LogOut, BarChart3, Users, ShieldCheck, Database, Briefcase, Zap 
} from "lucide-react";

// --- Reusable StatBox ---
const StatBox = ({ label, value, color, isDark }) => (
  <div className={`border p-6 rounded-3xl relative overflow-hidden ${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
    <p className={`text-[10px] uppercase font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500 font-bold'}`}>{label}</p>
    <h4 className={`text-3xl font-black font-mono ${color}`}>{value}</h4>
    <div className={`absolute -right-2 -bottom-2 opacity-10`}>
      <Zap size={60} />
    </div>
  </div>
);

export default function AdminDashboard({ isDark, goBack }) {
  const [stats, setStats] = useState([
    { label: "Total CAPEX", value: "$12.4B", color: "text-cyan-500" },
    { label: "Active Projects", value: "842", color: "text-emerald-500" },
    { label: "System Health", value: "98%", color: "text-amber-500" },
    { label: "Pending Approvals", value: "14", color: "text-rose-500" },
  ]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative z-10 p-10 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic">
            EXECUTIVE <span className="text-cyan-600">COMMAND</span>
          </h1>
          <p className="font-mono text-[10px] opacity-50 tracking-[5px] mt-2 uppercase">
            Status: Governing All Nodes
          </p>
        </div>
        <button 
          onClick={goBack} 
          className="p-4 bg-red-500/10 text-red-500 rounded-2xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={16}/> Terminate Session
        </button>
      </div>

      {/* Stats Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((s, idx) => (
          <StatBox key={idx} label={s.label} value={s.value} color={s.color} isDark={isDark} />
        ))}
      </div>

      {/* Main Dashboard Area */}
      <div className={`border ${isDark ? 'border-white/5 bg-slate-900/30' : 'border-slate-200 bg-white'} rounded-[40px] p-10 h-96 flex items-center justify-center`}>
        <div className="text-center opacity-20">
          <BarChart3 size={80} className="mx-auto mb-4" />
          <p className="font-mono uppercase tracking-[10px]">Global Fiscal Overview - Loading...</p>
        </div>
      </div>
    </motion.div>
  );
}
