import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function HeadOfficeLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Future: Add authentication logic here
    console.log("Head Office Login Attempt:", username);
    navigate('/headoffice/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Portal
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Building2 size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black">HEAD OFFICE</h2>
            <p className="text-slate-500">Secure Administrative Access</p>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text"
            placeholder="Head Office ID"
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="password"
            placeholder="Password"
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
}