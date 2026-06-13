import React, { useState, useRef } from 'react';
import './Dashboard.css';
import { User, Briefcase, RefreshCw, Settings, ArrowLeft, Send, Calendar, Edit3, LogOut, Save, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [profilePic, setProfilePic] = useState(null);
 
  // Profile State
  const [profileData, setProfileData] = useState({ name: 'John Doe', reg: 'REG/2021/CS/088', email: 'john.doe@example.com', phone: '071-2345678' });
  const [profileForm, setProfileForm] = useState(profileData);

  // Job State
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [jobTrackingData, setJobTrackingData] = useState([
    { sNo: 1, jobNo: "JB-7701", jobName: "Foundation Piling", to: "Eng. Smith", allCot: "Site A", regDate: "2026-06-01", visitDate: "2026-06-05", estDate: "2026-06-10" }
  ]);
  const [approvalData, setApprovalData] = useState([
    { sNo: 1, jobNo: "JB-7701", to: "Manager", jobName: "Foundation Piling", reqDate: "2026-06-11", allocation: "Site A", estAmount: "50,000", approval: "Pending" }
  ]);

  const handleLogout = () => { if (window.confirm("Are you sure you want to log out?")) navigate('/'); };
  const startEdit = (job) => { setEditingJob(job.jobNo); setEditForm(job); };
  const handleUpdate = () => { setJobTrackingData(jobTrackingData.map(j => j.jobNo === editForm.jobNo ? editForm : j)); setEditingJob(null); };
  const handleApprove = (id, status) => { setApprovalData(approvalData.map(j => j.jobNo === id ? { ...j, approval: status } : j)); };
  const handleSaveProfile = () => { setProfileData(profileForm); alert("Profile Updated!"); };

  return (
    <div id="cems-user-dashboard" className={isDark ? 'dark-mode' : 'light-mode'}>
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="profile-box">
            <div className="profile-photo">{profilePic ? <img src={profilePic} alt="Profile" /> : <User size={48} />}</div>
            <h3>{profileData.name}</h3>
            <p className="reg-number">{profileData.reg}</p>
          </div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'my-jobs' ? 'active' : ''}`} onClick={() => setActiveTab('my-jobs')}><Briefcase size={18} /> My Jobs</button>
            <button className={`nav-item ${activeTab === 'update-progress' ? 'active' : ''}`} onClick={() => setActiveTab('update-progress')}><RefreshCw size={18} /> Update Progress</button>
            <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><Edit3 size={18} /> Profile</button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Settings</button>
            <button className="nav-item logout-nav-item" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </nav>
        </aside>

        <main className="dashboard-content">
          <header className="content-header">
            <div className="header-left">
            </div>
          </header>

          {activeTab === 'my-jobs' && (
            <>
              <h3>Job Tracking & Estimation</h3>
              <table className="project-table">
                <thead><tr><th>No</th><th>Job No</th><th>Job Name</th><th>TO</th><th>All Cot</th><th>Date of register</th><th>Date of Site visit</th><th>Date of Estimation</th><th>Action</th></tr></thead>
                <tbody>
                  {jobTrackingData.map((job) => (
                    <tr key={job.jobNo}>
                      <td>{job.sNo}</td><td>{job.jobNo}</td><td>{job.jobName}</td><td>{job.to}</td><td>{job.allCot}</td><td>{job.regDate}</td><td>{job.visitDate}</td><td>{job.estDate}</td>
                      <td><button className="edit-btn" onClick={() => startEdit(job)}><Edit3 size={16} /> Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {editingJob && (
                <div className="edit-section" style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                  <h3>Update Job: {editForm.jobNo}</h3>
                  <input value={editForm.jobName} onChange={(e) => setEditForm({...editForm, jobName: e.target.value})} placeholder="Job Name" />
                  <input value={editForm.to} onChange={(e) => setEditForm({...editForm, to: e.target.value})} placeholder="TO" />
                  <input value={editForm.allCot} onChange={(e) => setEditForm({...editForm, allCot: e.target.value})} placeholder="All Cot" />
                  <input value={editForm.regDate} onChange={(e) => setEditForm({...editForm, regDate: e.target.value})} type="date" />
                  <input value={editForm.visitDate} onChange={(e) => setEditForm({...editForm, visitDate: e.target.value})} type="date" />
                  <input value={editForm.estDate} onChange={(e) => setEditForm({...editForm, estDate: e.target.value})} type="date" />
                  <button className="confirm-btn" onClick={handleUpdate}><Save size={16} /> Update Changes</button>
                </div>
              )}
              <h3 style={{ marginTop: '40px' }}>Approval Requests</h3>
              <table className="project-table">
                <thead><tr><th>Serial No</th><th>Job No</th><th>TO</th><th>Job Name</th><th>Date of request</th><th>Allocation</th><th>Est. amount</th><th>Approval</th></tr></thead>
                <tbody>
                  {approvalData.map((job) => (
                    <tr key={job.jobNo}>
                      <td>{job.sNo}</td><td>{job.jobNo}</td><td>{job.to}</td><td>{job.jobName}</td><td>{job.reqDate}</td><td>{job.allocation}</td><td>{job.estAmount}</td>
                      <td>{job.approval === 'Pending' ? (<><button className="approve-btn" onClick={() => handleApprove(job.jobNo, 'Yes')}><Check size={16} /></button><button className="reject-btn" onClick={() => handleApprove(job.jobNo, 'No')}><X size={16} /></button></>) : (<span>{job.approval}</span>)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section" style={{ padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left', width: '500px', margin: '0' }}>
              <h3>Personal Details</h3>
              <div className="profile-form">
                <label>FULL NAME</label>
                <input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
                <label>REGISTRATION NUMBER</label>
                <input value={profileForm.reg} onChange={(e) => setProfileForm({...profileForm, reg: e.target.value})} />
                <label>EMAIL ADDRESS</label>
                <input value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} />
                <label>PHONE NUMBER</label>
                <input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                <div className="action-buttons">
                  <button className="confirm-btn" onClick={handleSaveProfile}>Confirm</button>
                  <button className="cancel-btn" onClick={() => setProfileForm(profileData)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section" style={{ padding: '20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3>System Settings</h3>
              <p>Manage your account preferences and system configurations here.</p>
              <div className="profile-form">
                <label>NOTIFICATION PREFERENCES</label>
                <select><option>Email Notifications</option><option>SMS Notifications</option></select>
                <label>THEME</label>
                <select><option>Light Mode</option><option>Dark Mode</option></select>
                <button className="confirm-btn" style={{marginTop: '20px'}}>Save Settings</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;