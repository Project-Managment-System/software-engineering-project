import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { 
  ShieldCheck, Lock, User, Mail, Globe, Key, CheckCircle2, Fingerprint, Cpu, Zap, 
  ChevronRight, Box, Terminal, Activity 
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  // --- NEW STATE FOR PORTAL SELECTION ---
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sector: 'Logistics Alpha',
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

  const handlePortalSelect = (sector) => {
    setFormData(prev => ({ ...prev, sector: sector }));
    setSelectedPortal(sector);
    // Short delay for visual feedback before showing form
    setTimeout(() => setIsInitialized(true), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/auth/enroll", {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "ops", 
        unitId: formData.sector
      });

      console.log("Success:", res.data);
      setShowSuccess(true);
      setTimeout(() => navigate("/user/login"), 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Registration failed";
      console.error("Backend Error Details:", err.response?.data);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full bg-[#0d0d1a] border transition-all duration-300 rounded-2xl p-4 pl-12
    text-gray-100 placeholder-gray-600 outline-none
    ${focusedField === fieldName ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-white/10'}
  `;

  // --- PORTAL DATA ---
  const portals = [
    {
      id: 'Logistics Alpha',
      title: 'Logistics',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
      icon: <Box className="w-6 h-6" />
    },
    {
      id: 'Operations Bravo',
      title: 'Operations',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      icon: <Activity className="w-6 h-6" />
    },
    {
      id: 'Intelligence Gamma',
      title: 'Intelligence',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      icon: <Terminal className="w-6 h-6" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#05050a] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(5,5,10,1)_100%)]" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)', 
            backgroundSize: '30px 30px'
          }} 
        />
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[10000] bg-[#05050a]/95 flex items-center justify-center backdrop-blur-md">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(6,182,212,0.5)] animate-bounce">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Access Granted</h2>
          </div>
        </div>
      )}

      {/* --- PORTAL SELECTION VIEW --- */}
      {!isInitialized ? (
        <div className="relative z-10 w-full max-w-6xl animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-12">
            <h3 className="text-cyan-400 text-xs font-black uppercase tracking-[0.5em] mb-2">Identity Verification</h3>
            <h1 className="text-white text-4xl font-black tracking-tighter uppercase">Select Entry Portal</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portals.map((portal) => (
              <div 
                key={portal.id}
                onClick={() => handlePortalSelect(portal.id)}
                className="group relative h-[450px] rounded-[32px] overflow-hidden cursor-pointer border border-white/10 transition-all duration-500 hover:border-cyan-500/50 hover:scale-[1.02] bg-[#0f0f1e]"
              >
                {/* Image Layer - B&W by default, Color on hover */}
                <div 
                  className="absolute inset-0 grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                  style={{ 
                    backgroundImage: `url(${portal.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent opacity-80" />
                
                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    {portal.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{portal.title}</h2>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Initialize Enrollment</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* --- MAIN REGISTRATION FORM --- */
        <div className="relative w-full max-w-[540px] z-10 my-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
          <button 
            onClick={() => setIsInitialized(false)}
            className="absolute -top-12 left-0 text-gray-500 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <ChevronRight className="rotate-180 w-4 h-4" /> Change Portal
          </button>

          <form 
            onSubmit={handleSubmit}
            className="relative bg-[#0f0f1e]/90 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <header className="relative mb-8 text-center">
              <div className="inline-flex p-3 bg-[#16162a] rounded-2xl border border-cyan-500/20 mb-4">
                 <Cpu className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]">Clearance Request: {formData.sector}</h3>
                <h1 className="text-white text-3xl font-black tracking-tight uppercase">Field Enrollment</h1>
              </div>
            </header>

            <div className="space-y-5">
              <div className="group space-y-2">
                <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest ml-1">Personnel Designation</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    required 
                    name="name" 
                    type="text" 
                    placeholder="Enter Legal Name" 
                    className={inputClasses('name')} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('name')} 
                    onBlur={() => setFocusedField(null)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest ml-1">Comm Link Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      required 
                      name="email" 
                      type="email" 
                      placeholder="ops@system.net" 
                      className={inputClasses('email')} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('email')} 
                      onBlur={() => setFocusedField(null)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-purple-500 uppercase tracking-widest ml-1">Unit Sector</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select 
                      name="sector" 
                      className={`${inputClasses('sector')} appearance-none`} 
                      onChange={handleChange} 
                      value={formData.sector}
                    >
                      <option className="bg-[#0f0f1e]" value="Logistics Alpha">Logistics Alpha</option>
                      <option className="bg-[#0f0f1e]" value="Operations Bravo">Operations Bravo</option>
                      <option className="bg-[#0f0f1e]" value="Intelligence Gamma">Intelligence Gamma</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Access Key Integrity</span>
                  <span className={`text-[9px] font-black uppercase ${strength <= 40 ? 'text-red-500' : 'text-cyan-400'}`}>{strengthLabel}</span>
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full flex gap-1">
                  {[20, 40, 60, 80, 100].map((s) => (
                    <div key={s} className={`h-full flex-1 transition-all ${strength >= s ? 'bg-cyan-500' : 'bg-gray-800'}`} />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      required 
                      name="password" 
                      type="password" 
                      placeholder="Access Key" 
                      className={inputClasses('password')} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('password')} 
                      onBlur={() => setFocusedField(null)} 
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      required 
                      name="confirmPassword" 
                      type="password" 
                      placeholder="Repeat Key" 
                      className={inputClasses('confirmPassword')} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('confirmPassword')} 
                      onBlur={() => setFocusedField(null)} 
                    />
                  </div>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-[9px] text-red-500 text-right font-black uppercase tracking-tighter">Keys Not Matched</p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] text-center">Recovery Protocol</h4>
                <select 
                  name="recoveryQuestion" 
                  className={`${inputClasses('recoveryQuestion')} appearance-none`} 
                  onChange={handleChange} 
                  value={formData.recoveryQuestion}
                  required
                >
                  <option value="">Security Challenge Question</option>
                  <option value="system_override">First System Override Date</option>
                </select>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    required 
                    name="recoveryAnswer" 
                    type="text" 
                    placeholder="Secure Answer" 
                    className={inputClasses('recoveryAnswer')} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-black uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Zap className="animate-spin" size={18} /> : "Initialize Link"}
              </button>

              <footer className="text-center pt-4 border-t border-white/5">
                <button type="button" onClick={() => navigate('/user/login')} className="text-gray-500 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                  Already Registered? <span className="text-cyan-500 underline underline-offset-4">Secure Login</span>
                </button>
              </footer>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Register;