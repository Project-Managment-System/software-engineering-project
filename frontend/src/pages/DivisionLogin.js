import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, User, Shield } from 'lucide-react';
import axios from 'axios';

export default function DivisionLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [allUsers, setAllUsers] = useState([]); // For dynamic User login
  const navigate = useNavigate();

  // Fetch users on mount for dynamic validation
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/users');
        setAllUsers(res.data);
      } catch (err) { console.error("Error fetching system users:", err); }
    };
    fetchUsers();
  }, []);

  const engineerCredentials = {
    'enae1': 'ae1', 'enaw1': 'aw1', 'enme1': 'me1', 'enmi1': 'mi1',
    'enth1': 'th1', 'enke1': 'ke1', 'enpo1': 'po1', 'enhi1': 'hi1'
  };

  const divisionMap = {
    'enae1': 'Anuradhapura-East', 'enaw1': 'Anuradhapura-West',
    'enme1': 'Mihinthale', 'enth1': 'Thambuththegama',
    'enke1': 'Kekirawa', 'enpo1': 'Polonnaruwa', 'enhi1': 'Higurakgoda'
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
        alert('Invalid Admin credentials.');
      }
      return;
    }

    // 2. Engineer Check
    if (prefix === 'en') {
      if (engineerCredentials[username] === password) {
        localStorage.setItem('userDivision', divisionMap[username]);
        navigate('/engineer/dashboard');
      } else {
        alert('Invalid Engineering credentials.');
      }
      return;
    }
    console.log("Attempting Login for:", { username, password });
    console.log("Checking against these users:", allUsers);
    // 3. User Check (Dynamic - matches what you add in Engineer Dashboard)
    const authenticatedUser = allUsers.find(
      (u) => u.employeeId === username && u.password === password
    );

    if (authenticatedUser) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userDivision', authenticatedUser.division);
      localStorage.setItem('currentUserName', authenticatedUser.fullName);
      localStorage.setItem('userId', authenticatedUser._id);
      navigate('/user/dashboard');
      return;
    }

    // 4. Default / Other (Moved inside handleLogin)
    switch(prefix) {
      case 'da': alert('Divisional Assistant portal is under future development.'); break;
      case 'sa': alert('SuperAdmin portal is under future development.'); break;
      default: alert('Invalid username format or credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 font-bold">
          <ArrowLeft size={18} className="mr-2" /> BACK TO PORTAL
        </button>
        
        <div className="text-center mb-8">
          <Shield className="mx-auto text-blue-600 mb-4" size={48} />
          <h2 className="text-3xl font-black">SYSTEM LOGIN</h2>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Username / Employee ID"
              className="w-full pl-12 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input 
              type="password"
              placeholder="Password"
              className="w-full pl-12 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
}