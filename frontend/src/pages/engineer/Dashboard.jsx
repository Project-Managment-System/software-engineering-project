import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { User, Briefcase, RefreshCw, Settings, Edit3, LogOut, Save, Check, X, Menu, UserPlus, Undo, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [jobSubTab, setJobSubTab] = useState('approvals'); 
  const [profilePic, setProfilePic] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
      <button className="sidebar-toggle-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={20} /></button>
      <div className="user-dashboard-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-box">
            <div className="profile-photo">{profilePic ? <img src={profilePic} alt="Profile" /> : <User size={48} />}</div>
            <h3>{profileData.name}</h3>
            <p className="reg-number">{profileData.reg}</p>
          </div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'my-jobs' ? 'active' : ''}`} onClick={() => setActiveTab('my-jobs')}><Briefcase size={18} /> My Jobs</button>
            <button className={`nav-item ${activeTab === 'add-user' ? 'active' : ''}`} onClick={() => setActiveTab('add-user')}><UserPlus size={18} /> Add User</button>
            <button className={`nav-item ${activeTab === 'update-progress' ? 'active' : ''}`} onClick={() => setActiveTab('update-progress')}><RefreshCw size={18} /> Update Progress</button>
            <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><Edit3 size={18} /> Profile</button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Settings</button>
            <button className="nav-item logout-nav-item" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </nav>
        </aside>

        <main className={`dashboard-content ${isSidebarOpen ? 'content-shifted-open' : 'content-shifted-closed'}`}>
          {activeTab === 'my-jobs' && (
            <>
              <h3>My Jobs</h3>
              {/* Sub-tab Navigation */}
              <div className="sub-tabs" style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
                <button onClick={() => setJobSubTab('approvals')} style={{ padding: '10px', background: jobSubTab === 'approvals' ? '#ddd' : 'transparent', border: 'none', cursor: 'pointer' }}>Approval Requests</button>
                <button onClick={() => setJobSubTab('tracking')} style={{ padding: '10px', background: jobSubTab === 'tracking' ? '#ddd' : 'transparent', border: 'none', cursor: 'pointer' }}>Assignee</button>
              </div>

              {jobSubTab === 'tracking' && (
                <>
                  <table className="project-table">
                    <thead><tr><th>No</th><th>Job No</th><th>Division</th><th>Job Name</th><th>Allocation</th><th>Assignee</th><th>Action</th></tr></thead>
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
                      <input value={editForm.allocation} onChange={(e) => setEditForm({...editForm, allocation: e.target.value})} placeholder="Allocation" />
                      <button className="confirm-btn" onClick={handleUpdate}><Save size={16} /> Update Changes</button>
                    </div>
                  )}
                </>
              )}

              {jobSubTab === 'approvals' && (
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
              )}
            </>
          )}

          {activeTab === 'add-user' && (
             <div className="profile-section" style={{ padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left', width: '500px' }}>
               <h3>Add User Into System</h3>
               <form className="profile-form" onSubmit={handleSaveUser}>
                  <label>EMPLOYEE ID *</label><input name="employeeId" value={userFormData.employeeId} onChange={handleUserFormChange} />
                  <label>FIRST NAME *</label><input name="firstName" value={userFormData.firstName} onChange={handleUserFormChange} />
                  <label>EMAIL ADDRESS *</label><input type="email" name="email" value={userFormData.email} onChange={handleUserFormChange} />
                  <label>PASSWORD *</label><input type="password" name="password" value={userFormData.password} onChange={handleUserFormChange} />
                  <label>DIVISION</label><input name="division" value={userFormData.division} onChange={handleUserFormChange} />
                  <div className="action-buttons">
                    <button type="submit" className="confirm-btn">Save User</button>
                    <button type="button" className="cancel-btn" onClick={() => setActiveTab('my-jobs')}>Cancel</button>
                  </div>
               </form>
             </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section" style={{ padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left', width: '500px' }}>
              <h3 style={{ fontWeight: '800', textAlign: 'center', marginBottom: '20px' }}>Personal Details</h3>
              <div className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>FULL NAME</label><input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
                <label>REGISTRATION NUMBER</label><input value={profileForm.reg} onChange={(e) => setProfileForm({...profileForm, reg: e.target.value})} />
                <button className="confirm-btn" onClick={handleSaveProfile}>Confirm</button>
              </div>
            </div>
          )}

          {activeTab === 'update-progress' && <div className="placeholder-content"><p>Content for Update Progress coming soon...</p></div>}
          
          {activeTab === 'settings' && (
             <div className="settings-section" style={{ padding: '20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
               <h3>System Settings</h3>
               <div className="profile-form"><label>THEME</label><select><option>Light Mode</option><option>Dark Mode</option></select></div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;