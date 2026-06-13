import React, { useState } from 'react';
import { Save, Briefcase, RefreshCw, User, Settings, ArrowLeft, X, Check, Edit, Trash2, LogOut } from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('New Job');
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jobName: '', ministry: '', department: '', allocation: '', dateReq: '', ref: '', assign: ''
  });
  
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    regNo: 'REG/2021/CS/088',
    email: 'john.doe@example.com',
    phone: '071-2345678'
  });

  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
  };

  const handleConfirmProfile = () => {
    setUserProfile(tempProfile);
    alert("Profile updated successfully!");
  };

  const handleCancelProfile = () => {
    setTempProfile(userProfile);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // Redirects to the main portal URL
      window.location.href = '/'; 
    }
  };

  const handleAddJob = () => {
    if (editingId) {
      setJobs(jobs.map(job => job.id === editingId ? { ...formData, id: editingId, jobNo: job.jobNo } : job));
      setEditingId(null);
    } else {
      const newJob = { 
        ...formData, 
        id: Date.now(),
        jobNo: `JB-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setJobs([...jobs, newJob]);
    }
    handleCancel();
  };

  const handleDeleteJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const handleEditJob = (job) => {
    setEditingId(job.id);
    setFormData(job);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ jobName: '', ministry: '', department: '', allocation: '', dateReq: '', ref: '', assign: '' });
  };

  return (
    <div className="admin-dashboard-layout">
      <aside className="sidebar">
        <div className="user-profile">
          <div className="avatar-box"><User size={40} /></div>
          <h3>{userProfile.name}</h3>
          <p className="reg-text">{userProfile.regNo}</p>
        </div>
        <nav className="nav-links">
          <button className={activeTab === 'New Job' ? 'active' : ''} onClick={() => setActiveTab('New Job')}><Briefcase size={18} /> New Job</button>
          <button className={activeTab === 'Update Progress' ? 'active' : ''} onClick={() => setActiveTab('Update Progress')}><RefreshCw size={18} /> Update Progress</button>
          <button className={activeTab === 'Profile' ? 'active' : ''} onClick={() => setActiveTab('Profile')}><User size={18} /> Profile</button>
          <button className={activeTab === 'Settings' ? 'active' : ''} onClick={() => setActiveTab('Settings')}><Settings size={18} /> Settings</button>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
        </header>

        {activeTab === 'New Job' && (
          <section className="field-card">
            <div className="vertical-form">
              <div className="input-group">
                <label>Job Name</label>
                <input name="jobName" value={formData.jobName} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="input-group">
                <label>Ministry</label>
                <select name="ministry" value={formData.ministry} onChange={handleInputChange} className="input-field">
                  <option value="">Select Ministry</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                </select>
              </div>
              <div className="input-group">
                <label>Department</label>
                <select name="department" value={formData.department} onChange={handleInputChange} className="input-field">
                  <option value="">Select Department</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              <div className="input-group">
                <label>Allocation (Rs.)</label>
                <input name="allocation" type="number" value={formData.allocation} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="input-group">
                <label>Date of Request</label>
                <input name="dateReq" type="date" value={formData.dateReq} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="input-group">
                <label>Request Letter Reference</label>
                <input name="ref" value={formData.ref} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="input-group">
                <label>Job Assign (Name of Tech. Officer)</label>
                <input name="assign" value={formData.assign} onChange={handleInputChange} className="input-field" />
              </div>
            </div>
            <div className="button-group">
              <button className="save-btn blue-action-btn" onClick={handleAddJob}><Save size={18} /> {editingId ? 'Update' : 'OK'}</button>
              <button className="cancel-btn" onClick={handleCancel}><X size={18} /> Cancel</button>
            </div>

            <div style={{ marginTop: '40px' }}>
              <h3>Recent Jobs</h3>
              <table className="job-table">
                <thead>
                  <tr>
                    <th>Job No</th><th>Job Name</th><th>Ministry</th><th>Dept</th><th>Date</th><th>Allocation</th><th>Assignee</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id}>
                      <td>{j.jobNo}</td><td>{j.jobName}</td><td>{j.ministry}</td><td>{j.department}</td>
                      <td>{j.dateReq}</td><td>{j.allocation}</td><td>{j.assign}</td>
                      <td className="action-btns">
                        <button onClick={() => handleEditJob(j)} className="edit-btn"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteJob(j.id)} className="delete-btn"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'Profile' && (
          <section className="field-card">
            <div className="profile-form">
              <div className="input-group">
                <label>Full Name</label>
                <input name="name" value={tempProfile.name} onChange={handleProfileChange} className="input-field" />
              </div>
              <div className="input-group">
                <label>Registration Number</label>
                <input name="regNo" value={tempProfile.regNo} onChange={handleProfileChange} className="input-field" />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input name="email" value={tempProfile.email} onChange={handleProfileChange} className="input-field" />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input name="phone" value={tempProfile.phone} onChange={handleProfileChange} className="input-field" />
              </div>
              <div className="button-group">
                <button className="save-btn blue-action-btn" onClick={handleConfirmProfile}><Check size={18} /> Confirm</button>
                <button className="cancel-btn" onClick={handleCancelProfile}><X size={18} /> Cancel</button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;