import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function DivisionLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Define valid Engineering credentials
  const engineerCredentials = {
    'enae1': 'ae1',
    'enaw1': 'aw1',
    'enme1': 'me1',
    'enmi1': 'mi1',
    'enth1': 'th1',
    'enke1': 'ke1',
    'enpo1': 'po1',
    'enhi1': 'hi1'
  };

  // Add this mapping
const divisionMap = {
  'enae1': 'Anuradhapura-East',
  'enaw1': 'Anuradhapura-West',
  'enme1': 'Mihinthale',
  'enth1': 'Thambuththegama',
  'enke1': 'Kekirawa',
  'enpo1': 'Polonnaruwa',
  'enhi1': 'Higurakgoda'
};



  const handleLogin = (e) => {
    e.preventDefault();
    const prefix = username.substring(0, 2).toLowerCase();

    // 1. Admin Check
    if (prefix === 'cl') {
      if (username === 'cl0001' && password === 'cl1') {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');
      } else {
        alert('Invalid Admin credentials. Access Denied.');
      }
      return;
    }
    // Inside the Engineer check in handleLogin:
    if (engineerCredentials[username] === password) {
      localStorage.setItem('userDivision', divisionMap[username]); // Save division
      navigate('/engineer/dashboard');
    }

    // 2. Engineer Check (Strict Validation)
    if (prefix === 'en') {
      if (engineerCredentials[username] === password) {
        navigate('/engineer/dashboard');
      } else {
        alert('Invalid Engineering credentials. Access Denied.');
      }
      return;
    }

    // 3. Other Portals
    switch(prefix) {
      case 'us': navigate('/user/dashboard'); break;
      case 'da': alert('Divisional Assistant portal is under future development.'); break;
      case 'sa': alert('SuperAdmin portal is under future development.'); break;
      default: alert('Invalid username or credentials. Please check your input.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-500 hover:text-blue-600">
          <ArrowLeft size={18} className="mr-2" /> Back to Portal
        </button>
        
        <h2 className="text-3xl font-black mb-2">DIVISION LOGIN</h2>
        <p className="text-slate-500 mb-8">Enter credentials to access your hub.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text"
            placeholder="Username"
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
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
}