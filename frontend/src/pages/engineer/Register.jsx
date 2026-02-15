import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { 
  ShieldCheck, Lock, User, Mail, Globe, Key, CheckCircle2, Fingerprint, Cpu, Zap, HardHat, Wrench
} from 'lucide-react';

const EngineerRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sector: 'Structural Integrity',
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
    if (pass.length > 6) score += 20;
    if (pass.length > 10) score += 20;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 20;
    if (/\d/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;
    return score;
  };

  useEffect(() => {
    const score = calculateStrength(formData.password);
    setStrength(score);
    if (score === 0) setStrengthLabel('Void');
    else if (score <= 40) setStrengthLabel('Vulnerable');
    else if (score <= 60) setStrengthLabel('Standard');
    else if (score <= 80) setStrengthLabel('Secure');
    else setStrengthLabel('Titanium');
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/auth/engineer/enroll", {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "engineer", 
        unitId: formData.sector
      });

      setShowSuccess(true);
      setTimeout(() => navigate("/engineer/login"), 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Registry failed";
      alert(`Engineering Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full bg-[#0d0d08] border transition-all duration-300 rounded-2xl p-4 pl-12
    text-amber-50 placeholder-gray-700 outline-none
    ${focusedField === fieldName ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-white/10'}
  `;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#080805] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,15,5,1)_0%,rgba(8,8,5,1)_100%)]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(245,158,11,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.1) 1px, transparent 1px)', 
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[10000] bg-[#080805]/95 flex items-center justify-center backdrop-blur-md">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-bounce">
              <CheckCircle2 size={40} className="text-black" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Registry Validated</h2>
            <p className="text-amber-500 font-mono text-sm uppercase">Redirecting to Terminal...</p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-[540px] z-10 my-auto">
        <form 
          onSubmit={handleSubmit}
          className="relative bg-[#14120c]/90 backdrop-blur-2xl border border-amber-500/10 rounded-[40px] p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
        >
          <header className="relative mb-8 text-center">
            <div className="inline-flex p-3 bg-[#1c1a10] rounded-2xl border border-amber-500/20 mb-4">
                <Wrench className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">Specialist Onboarding</h3>
              <h1 className="text-white text-3xl font-black tracking-tight uppercase">Engineering Registry</h1>
            </div>
          </header>

          <div className="space-y-5">
            <div className="group space-y-2">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Specialist Legal Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                <input 
                  required 
                  name="name" 
                  type="text" 
                  placeholder="Enter Full Designation" 
                  className={inputClasses('name')} 
                  onChange={handleChange} 
                  onFocus={() => setFocusedField('name')} 
                  onBlur={() => setFocusedField(null)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Registry Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                  <input 
                    required 
                    name="email" 
                    type="email" 
                    placeholder="eng@cems-ops.net" 
                    className={inputClasses('email')} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('email')} 
                    onBlur={() => setFocusedField(null)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Assigned Division</label>
                <div className="relative">
                  <HardHat className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                  <select 
                    name="sector" 
                    className={`${inputClasses('sector')} appearance-none`} 
                    onChange={handleChange} 
                    value={formData.sector}
                  >
                    <option className="bg-[#14120c]" value="Structural Integrity">Structural Integrity</option>
                    <option className="bg-[#14120c]" value="Grid Maintenance">Grid Maintenance</option>
                    <option className="bg-[#14120c]" value="Cyber-Physical Systems">Cyber-Physical Systems</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 bg-black/40 rounded-3xl border border-amber-900/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-amber-900 uppercase tracking-widest">Key Strength Analysis</span>
                <span className={`text-[9px] font-black uppercase ${strength <= 40 ? 'text-red-500' : 'text-amber-400'}`}>{strengthLabel}</span>
              </div>
              <div className="h-1 w-full bg-gray-900 rounded-full flex gap-1">
                {[20, 40, 60, 80, 100].map((s) => (
                  <div key={s} className={`h-full flex-1 transition-all ${strength >= s ? 'bg-amber-500' : 'bg-gray-800'}`} />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                  <input 
                    required 
                    name="password" 
                    type="password" 
                    placeholder="Encryption Key" 
                    className={inputClasses('password')} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('password')} 
                    onBlur={() => setFocusedField(null)} 
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                  <input 
                    required 
                    name="confirmPassword" 
                    type="password" 
                    placeholder="Verify Key" 
                    className={inputClasses('confirmPassword')} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('confirmPassword')} 
                    onBlur={() => setFocusedField(null)} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-amber-900/50 uppercase tracking-[0.3em] text-center">Safety Protocol Recovery</h4>
              <select 
                name="recoveryQuestion" 
                className={`${inputClasses('recoveryQuestion')} appearance-none`} 
                onChange={handleChange} 
                value={formData.recoveryQuestion}
                required
              >
                <option value="">Select Security Challenge</option>
                <option value="first_tool">Serial Number of First Toolkit</option>
                <option value="mentor">Master Technician Name</option>
              </select>
              <div className="relative">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                <input 
                  required 
                  name="recoveryAnswer" 
                  type="text" 
                  placeholder="Hashed Recovery Answer" 
                  className={inputClasses('recoveryAnswer')} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-600 text-black font-black uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
              {isSubmitting ? <Zap className="animate-spin" size={18} /> : "Establish Registry"}
            </button>

            <footer className="text-center pt-4 border-t border-white/5">
              <button type="button" onClick={() => navigate('/engineer/login')} className="text-gray-500 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                Registry Active? <span className="text-amber-500 underline underline-offset-4">Specialist Login</span>
              </button>
            </footer>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EngineerRegister;