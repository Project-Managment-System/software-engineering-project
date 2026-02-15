import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { 
  ShieldAlert, Lock, User, Mail, Globe, Key, CheckCircle2, Fingerprint, Zap
} from 'lucide-react';

const AdminRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sector: 'Central Command',
    password: '',
    confirmPassword: '',
    recoveryQuestion: '',
    recoveryAnswer: ''
  });

  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('Void');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 20; 
    if (pass.length > 12) score += 20;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 20;
    if (/\d/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    return score;
  };

  useEffect(() => {
    const score = calculateStrength(formData.password);
    setStrength(score);
    if (score === 0) setStrengthLabel('Void');
    else if (score <= 40) setStrengthLabel('Critical');
    else if (score <= 60) setStrengthLabel('Restricted');
    else if (score <= 80) setStrengthLabel('Fortified');
    else setStrengthLabel('Omega-Level');
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post("http://127.0.0.1:5000/api/auth/admin/enroll", {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "admin", 
        unitId: formData.sector
      });

      setShowSuccess(true);
      setTimeout(() => navigate("/admin/login"), 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.error || "Provisioning Failed";
      alert(`System Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Applied text-slate-400 (#94a3b8) to input text and placeholders
  const inputClasses = (fieldName) => `
    w-full bg-[#0d0505] border transition-all duration-300 rounded-2xl p-4 pl-12
    text-slate-400 placeholder-slate-400/30 outline-none
    ${focusedField === fieldName ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-red-500/10'}
  `;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050000] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,0,0,1)_0%,rgba(5,0,0,1)_100%)]" />
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(220,38,38,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.1) 1px, transparent 1px)', 
            backgroundSize: '20px 20px'
          }} 
        />
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[10000] bg-[#050000]/95 flex items-center justify-center backdrop-blur-md">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(220,38,38,0.6)] animate-pulse">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-400 tracking-tighter uppercase">Root Provisioned</h2>
            <p className="text-slate-400/80 font-mono text-sm uppercase">Synchronizing Admin Privileges...</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-[540px] z-10 my-auto">
        <form 
          onSubmit={handleSubmit}
          className="relative bg-[#120505]/95 backdrop-blur-2xl border border-red-500/20 rounded-[40px] p-8 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.9)]"
        >
          <header className="relative mb-8 text-center">
            <div className="inline-flex p-3 bg-[#1a0505] rounded-2xl border border-red-600/30 mb-4">
                <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em]">High-Level Provisioning</h3>
              <h1 className="text-slate-400 text-3xl font-black tracking-tight uppercase">Admin Core Registry</h1>
            </div>
          </header>

          <div className="space-y-5">
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Identity</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                <input 
                  required 
                  name="name" 
                  type="text" 
                  placeholder="Root Legal Name" 
                  className={inputClasses('name')} 
                  onChange={handleChange} 
                  onFocus={() => setFocusedField('name')} 
                  onBlur={() => setFocusedField(null)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                  <input 
                    required 
                    name="email" 
                    type="email" 
                    placeholder="root@cems-os.internal" 
                    className={inputClasses('email')} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('email')} 
                    onBlur={() => setFocusedField(null)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Command Sector</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                  <select 
                    name="sector" 
                    className={`${inputClasses('sector')} appearance-none text-slate-400`} 
                    onChange={handleChange} 
                    value={formData.sector}
                  >
                    <option className="bg-[#120505] text-slate-400" value="Central Command">Central Command</option>
                    <option className="bg-[#120505] text-slate-400" value="Global Security">Global Security</option>
                    <option className="bg-[#120505] text-slate-400" value="Data Sovereignty">Data Sovereignty</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 bg-black/60 rounded-3xl border border-red-900/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Master Key Integrity</span>
                <span className={`text-[9px] font-black uppercase ${strength <= 40 ? 'text-red-700' : 'text-red-500'}`}>{strengthLabel}</span>
              </div>
              <div className="h-1 w-full bg-red-950/30 rounded-full flex gap-1">
                {[20, 40, 60, 80, 100].map((s) => (
                  <div key={s} className={`h-full flex-1 transition-all ${strength >= s ? 'bg-red-600' : 'bg-transparent'}`} />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                  <input 
                    required 
                    name="password" 
                    type="password" 
                    placeholder="Master Key" 
                    className={inputClasses('password')} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('password')} 
                    onBlur={() => setFocusedField(null)} 
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                  <input 
                    required 
                    name="confirmPassword" 
                    type="password" 
                    placeholder="Confirm Master" 
                    className={inputClasses('confirmPassword')} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('confirmPassword')} 
                    onBlur={() => setFocusedField(null)} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Root Override Protocols</h4>
              <select 
                name="recoveryQuestion" 
                className={`${inputClasses('recoveryQuestion')} appearance-none text-slate-400`} 
                onChange={handleChange} 
                value={formData.recoveryQuestion}
                required
              >
                <option value="" className="text-red-900">Security Override Question</option>
                <option value="legacy_code" className="text-slate-400">First Compiled Legacy Code</option>
                <option value="station_id" className="text-slate-400">Original Station Identifier</option>
              </select>
              <div className="relative">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-900" />
                <input 
                  required 
                  name="recoveryAnswer" 
                  type="text" 
                  placeholder="Hashed Override Answer" 
                  className={inputClasses('recoveryAnswer')} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-900 via-red-600 to-red-800 text-white font-black uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
              {isSubmitting ? <Zap className="animate-spin" size={18} /> : "Initialize Root Registry"}
            </button>

            <footer className="text-center pt-4 border-t border-red-900/20">
              <button type="button" onClick={() => navigate('/admin/login')} className="text-slate-400/60 hover:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                Override Exists? <span className="text-red-500 underline underline-offset-4">Admin Login</span>
              </button>
            </footer>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;