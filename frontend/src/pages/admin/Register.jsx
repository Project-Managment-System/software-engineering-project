import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft, ShieldPlus, ShieldQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/api';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState('system');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');

  const getStrength = (val) => {
    if (val.length === 0) return { label: '', color: 'bg-slate-200' };
    if (val.length < 8) return { label: 'Weak', color: 'bg-red-500' };
    if (val.length < 12) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Strong', color: 'bg-indigo-600' };
  };
  const strength = getStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      await registerUser({
        fullName,
        email,
        password,
        confirmPassword,
        role: 'admin',
        recoveryQuestion,
        recoveryAnswer,
      });
      alert('Admin registered successfully. Please login.');
      navigate('/admin/login');
    } catch (error) {
      alert(error.response?.data?.message || error.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-xl border border-slate-200"
    >
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-black text-sm uppercase">
        <ArrowLeft size={18} /> Back to portal
      </button>

      <div className="mb-8 text-center">
        <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <ShieldPlus size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">ADMIN AUTHORIZATION</h2>
      </div>

      <form className="space-y-5" onSubmit={handleRegister}>
        <div className="relative">
          <User className="absolute left-4 top-4 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Admin ID"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none text-slate-900 font-normal"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
          <input
            type="email"
            placeholder="Institutional Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none text-slate-900 font-normal"
          />
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none text-slate-900 font-normal"
            />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className={`h-1.5 w-full rounded-full ${strength.color}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{strength.label}</span>
          </div>
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none text-slate-900 font-normal"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase">Security Recovery Question</label>
          <div className="relative">
            <ShieldQuestion className="absolute left-4 top-3 text-slate-400" size={20} />
            <select
              value={recoveryQuestion}
              onChange={(e) => setRecoveryQuestion(e.target.value)}
              className="w-full pl-12 pr-4 py-2 rounded-lg border border-slate-200 bg-white outline-none text-sm text-slate-900 font-normal"
            >
              <option value="system">What is your primary system authorization key?</option>
              <option value="admin_origin">Which facility did you originate from?</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Your Answer"
            value={recoveryAnswer}
            onChange={(e) => setRecoveryAnswer(e.target.value)}
            required
            className="w-full p-2 rounded-lg border border-slate-200 bg-white outline-none text-sm text-slate-900 font-normal"
          />
        </div>

        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 uppercase">
          Register Administrator
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-slate-400 font-normal italic">
        Administrative registration requires dual-factor verification.
      </p>
    </motion.div>
  );
}