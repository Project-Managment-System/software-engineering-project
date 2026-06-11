import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft, HardHat, ShieldQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

export default function EngineerRegister() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getStrength = (val) => {
    if (val.length === 0) return { label: '', color: 'bg-slate-200' };
    if (val.length < 6) return { label: 'Weak', color: 'bg-red-500' };
    if (val.length < 10) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Strong', color: 'bg-emerald-600' };
  };
  const strength = getStrength(password);

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    navigate('/engineer/login');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200"
    >
      {/* Back Button */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-8 font-black text-sm uppercase">
        <ArrowLeft size={18} /> Back to portal
      </button>

      <div className="mb-8 text-center">
        <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <HardHat size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">ENGINEER REGISTRATION</h2>
      </div>

      <form className="space-y-5" onSubmit={handleRegister}>
        {/* Input fields */}
        <div className="relative"><User className="absolute left-4 top-4 text-slate-400" size={20} /><input type="text" placeholder="Engineer ID" required className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none text-slate-900 font-normal" /></div>
        <div className="relative"><Mail className="absolute left-4 top-4 text-slate-400" size={20} /><input type="email" placeholder="Professional Email" required className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none text-slate-900 font-normal" /></div>

        <div>
          <div className="relative"><Lock className="absolute left-4 top-4 text-slate-400" size={20} /><input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none text-slate-900 font-normal" /></div>
          <div className="mt-2 flex items-center gap-3">
            <div className={`h-1.5 w-full rounded-full ${strength.color}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{strength.label}</span>
          </div>
        </div>

        <div className="relative"><Lock className="absolute left-4 top-4 text-slate-400" size={20} /><input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-emerald-500 outline-none text-slate-900 font-normal" /></div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase">Security Recovery Question</label>
          <div className="relative">
            <ShieldQuestion className="absolute left-4 top-3 text-slate-400" size={20} />
            <select className="w-full pl-12 pr-4 py-2 rounded-lg border border-slate-200 bg-white outline-none text-sm text-slate-900 font-normal">
              <option value="project">What was your first major project?</option>
              <option value="school">What university did you attend?</option>
              <option value="mentor">What is the name of your first mentor?</option>
            </select>
          </div>
          <input type="text" placeholder="Your Answer" required className="w-full p-2 rounded-lg border border-slate-200 bg-white outline-none text-sm text-slate-900 font-normal" />
        </div>

        <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 uppercase">
          Register Engineer
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 font-normal">
        Already registered? <Link to="/engineer/login" className="text-emerald-600 font-black hover:underline">Login here</Link>
      </p>
    </motion.div>
  );
}