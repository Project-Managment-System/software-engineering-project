import React, { useState, useRef } from 'react';
import { Save, Briefcase, RefreshCw, User, Settings, ArrowLeft, X, Check, Edit, Trash2, LogOut, Edit3, Camera, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('New Job');
  
  // Collapsible Sidebar visibility control state variable
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Existing Admin Job State
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jobName: '', ministry: '', department: '', allocation: '', dateReq: '', ref: '', assign: ''
  });
  
  // State Strings matching User Code logic exactly
  const [profileName, setProfileName] = useState('John Doe');
  const [regNo, setRegNo] = useState('REG/2021/CS/088');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phoneNo, setPhoneNo] = useState('071-2345678');
  const [profilePic, setProfilePic] = useState(null);

  // Individual temporary edit fields
  const [editProfileName, setEditProfileName] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNo, setEditPhoneNo] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Sync state to individual placeholders when tab opens
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
    alert("Profile Saved!");
  };

  const handleCancelProfile = () => {
    setActiveTab('New Job');
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="cems-user-dashboard" className={isDark ? 'dark-mode' : 'light-mode'}>
      
      {/* Floating Hamburger Button */}
      <button 
        className="sidebar-toggle-menu-btn" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}
      >
        <Menu size={20} />
      </button>

      {/* Root Flex Layout Class */}
      <div className="admin-dashboard-layout">
        
        {/* Sidebar Structure with dynamic class state binding */}
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="user-profile">
            <div className="avatar-box" style={{ overflow: 'hidden' }}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} />
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{profileName}</h3>
              <p className="reg-text">{regNo}</p>
            </div>
          </div>
          <nav className="nav-links">
            <button 
              className={activeTab === 'New Job' ? 'active' : ''} 
              onClick={() => setActiveTab('New Job')}
            >
              <Briefcase size={18} /> New Job
            </button>
            <button 
              className={activeTab === 'Update Progress' ? 'active' : ''} 
              onClick={() => setActiveTab('Update Progress')}
            >
              <RefreshCw size={18} /> Update Progress
            </button>
            <button 
              className={activeTab === 'Profile' ? 'active' : ''} 
              onClick={() => {
                setActiveTab('Profile');
                handleProfileTabOpen();
              }}
            >
              <Edit3 size={18} /> Profile
            </button>
            <button 
              className={activeTab === 'Settings' ? 'active' : ''} 
              onClick={() => setActiveTab('Settings')}
            >
              <Settings size={18} /> Settings
            </button>
            <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </nav>
        </aside>

        {/* Adaptive Main Area Panel Workspace (Uses conditional modifier classes) */}
        <main className={`main-content ${isSidebarOpen ? 'content-shifted-open' : 'content-shifted-closed'}`}>
          <header className="content-header">
            <div className="header-left"></div>
          </header>

          {/* New Job Layout Context */}
          {activeTab === 'New Job' && (
            <section className="project-table-section">
              <div className="field-card">
                <div className="vertical-form">
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Job Name</label>
                    <input name="jobName" value={formData.jobName} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Ministry</label>
                    <select name="ministry" value={formData.ministry} onChange={handleInputChange} className="input-field">
                      <option value="">Select Ministry</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Department</label>
                    <select name="department" value={formData.department} onChange={handleInputChange} className="input-field">
                      <option value="">Select Department</option>
                      <option value="Procurement">Procurement</option>
                      <option value="Engineering">Engineering</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Allocation (Rs.)</label>
                    <input name="allocation" type="number" value={formData.allocation} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Date of Request</label>
                    <input name="dateReq" type="date" value={formData.dateReq} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Request Letter Reference</label>
                    <input name="ref" value={formData.ref} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Job Assign (Name of Tech. Officer)</label>
                    <input name="assign" value={formData.assign} onChange={handleInputChange} className="input-field" />
                  </div>
                </div>
                <div className="button-group">
                  <button className="blue-action-btn" onClick={handleAddJob}>
                    <Save size={16} /> {editingId ? 'Update' : 'OK'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    <X size={16} /> Cancel
                  </button>
                </div>

                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontWeight: 900, color: '#1e293b' }}>Recent Jobs</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="job-table">
                      <thead>
                        <tr>
                          <th>Job No</th><th>Job Name</th><th>Ministry</th><th>Dept</th><th>Date</th><th>Allocation</th><th>Assignee</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((j) => (
                          <tr key={j.id}>
                            <td style={{ fontFamily: 'monospace', color: '#0ea5e9' }}>{j.jobNo}</td>
                            <td style={{ fontWeight: 700 }}>{j.jobName}</td>
                            <td>{j.ministry}</td>
                            <td>{j.department}</td>
                            <td>{j.dateReq}</td>
                            <td style={{ fontWeight: 700 }}>{j.allocation}</td>
                            <td>{j.assign}</td>
                            <td>
                              <div className="action-btns">
                                <button className="edit-btn" onClick={() => handleEditJob(j)}><Edit size={16} /></button>
                                <button className="delete-btn" onClick={() => handleDeleteJob(j.id)}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Profile View Sub-tab */}
          {activeTab === 'Profile' && (
            <section className="profile-view">
              <div className="field-card">
                <div className="profile-form">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                      <button onClick={() => fileInputRef.current.click()} style={{ position: 'absolute', bottom: '0', right: '0', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}><Camera size={16}/></button>
                    </div>
                    <h3 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>Personal Details</h3>
                  </div>
                  
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>FULL NAME</label>
                    <input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>REGISTRATION NUMBER</label>
                    <input type="text" value={editRegNo} onChange={(e) => setEditRegNo(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>EMAIL ADDRESS</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>PHONE NUMBER</label>
                    <input type="text" value={editPhoneNo} onChange={(e) => setEditPhoneNo(e.target.value)} className="input-field" />
                  </div>
                  
                  <div className="button-group">
                    <button className="blue-action-btn" onClick={handleConfirmProfile} style={{ background: 'purple' }}>
                      Confirm
                    </button>
                    <button className="cancel-btn" onClick={handleCancelProfile}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Update Progress' && (
            <div className="placeholder-content">
              <p>Content for {activeTab} coming soon...</p>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="placeholder-content">
              <p>Content for {activeTab} coming soon...</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default AdminDashboard;