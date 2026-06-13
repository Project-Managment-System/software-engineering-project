import React, { useState, useRef } from 'react';
import './Dashboard.css';
import { User, Briefcase, RefreshCw, Settings, ArrowLeft, Send, Calendar, Save, Edit3, Camera, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [profileName, setProfileName] = useState('Engineer Doe');
  const [regNo, setRegNo] = useState('ENG/2026/001');
  const [email, setEmail] = useState('eng.doe@company.com');
  const [phoneNo, setPhoneNo] = useState('071-2345678');

  const [editProfileName, setEditProfileName] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNo, setEditPhoneNo] = useState('');

  const handleProfileTabOpen = () => {
    setEditProfileName(profileName);
    setEditRegNo(regNo);
    setEditEmail(email);
    setEditPhoneNo(phoneNo);
  };

  const handleConfirmProfile = () => {
    setProfileName(editProfileName);
    setRegNo(editRegNo);
    setEmail(editEmail);
    setPhoneNo(editPhoneNo);
    alert("Profile Updated!");
  };

  const handleCancelProfile = () => {
    setActiveTab('my-jobs');
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      window.location.href = '/';
    }
  };

  return (
    <div className={`dashboard-wrapper ${isDark ? 'dark-mode' : 'light-mode'}`}>
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="profile-box">
            <div className="profile-photo"><User size={48} /></div>
            <h3>{profileName}</h3>
            <p>{regNo}</p>
          </div>
          <nav className="sidebar-nav">
            <button className={activeTab === 'my-jobs' ? 'active' : ''} onClick={() => setActiveTab('my-jobs')}><Briefcase size={18} /> Projects</button>
            <button className={activeTab === 'update-progress' ? 'active' : ''} onClick={() => setActiveTab('update-progress')}><RefreshCw size={18} /> Site Progress</button>
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => {
              setActiveTab('profile');
              handleProfileTabOpen();
            }}><Edit3 size={18} /> Profile</button>
            <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </nav>
        </aside>

        <main className="dashboard-content">
          <header className="content-header">
          </header>

          {activeTab === 'profile' && (
            <section className="profile-section">
              <div className="field-card">
                <div className="input-group"><label>FULL NAME</label><input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} /></div>
                <div className="input-group"><label>REGISTRATION NUMBER</label><input type="text" value={editRegNo} onChange={(e) => setEditRegNo(e.target.value)} /></div>
                <div className="input-group"><label>EMAIL ADDRESS</label><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
                <div className="input-group"><label>PHONE NUMBER</label><input type="text" value={editPhoneNo} onChange={(e) => setEditPhoneNo(e.target.value)} /></div>
                
                <div className="action-buttons">
                  <button className="confirm-btn" onClick={handleConfirmProfile}><CheckCircle size={18} /> Confirm</button>
                  <button className="cancel-btn" onClick={handleCancelProfile}><XCircle size={18} /> Cancel</button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;