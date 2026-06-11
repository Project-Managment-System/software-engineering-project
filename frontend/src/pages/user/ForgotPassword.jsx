import React, { useState } from 'react';
import { ShieldQuestion, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200"
    >
      {/* Back Button */}
      <button 
        onClick={() => navigate('/user/login')} 
        className="flex items-center gap-2 text-slate-500 hover:text-pink-600 mb-8 font-bold text-sm transition-colors"
      >
        <ArrowLeft size={18} /> BACK TO LOGIN
      </button>

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-slate-900">
          {step === 1 ? "RESET PASSWORD" : "SET NEW PASSWORD"}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          {step === 1 ? "Verify your identity to proceed." : "Create your secure new password."}
        </p>
      </div>

      {step === 1 ? (
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Select Security Question</label>
            <div className="relative">
              <ShieldQuestion className="absolute left-4 top-3 text-slate-400" size={20} />
              <select className="w-full pl-12 pr-4 py-2 rounded-lg border border-slate-200 bg-white outline-none text-sm text-slate-700">
                <option>What was your childhood pet's name?</option>
                <option>What was the name of your first school?</option>
                <option>In what city were you born?</option>
                <option>What is your favorite movie?</option>
                <option>What was the name of your favorite teacher?</option>
              </select>
            </div>
            <input type="text" placeholder="Your Answer" required className="w-full p-2 rounded-lg border border-slate-200 bg-white outline-none text-sm" />
          </div>
          <button type="submit" className="w-full py-4 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-200">VERIFY IDENTITY</button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); navigate('/user/login'); }}>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input type="password" placeholder="New Password" required className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-pink-500 outline-none" />
          </div>
          <button type="submit" className="w-full py-4 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-200">UPDATE PASSWORD</button>
        </form>
      )}
    </motion.div>
  );
}