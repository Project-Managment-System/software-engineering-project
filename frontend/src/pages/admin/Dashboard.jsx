import React, { useState, useRef } from 'react';
import { Save, Briefcase, RefreshCw, User, Settings, ArrowLeft, X, Check, Edit, Trash2, LogOut, Edit3, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('New Job');
  
  // Existing Admin Job State
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
  jobName: '', ministry: 'Finance', department: 'Procurement', division: 'Administration',
  allocation: '', dateReq: '', ref: '', institute: ''
});
  
  // Refactored State Strings to match User Code logic exactly
  const [profileName, setProfileName] = useState('John Doe');
  const [regNo, setRegNo] = useState('REG/2021/CS/088');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phoneNo, setPhoneNo] = useState('071-2345678');
  const [profilePic, setProfilePic] = useState(null);

  // Individual temporary edit fields matching User component
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

  /*added*/
  const isFormValid = () => {
  const { division, jobName, ministry, department, allocation, dateReq, ref } = formData;
  return !!(division && jobName && ministry && department && allocation && dateReq && ref);
};

  const handleAddJob = () => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  if (editingId) {
    setJobs(jobs.map(job => job.id === editingId
      ? { ...formData, id: editingId, jobNo: job.jobNo, submitDate: job.submitDate }
      : job
    ));
    setEditingId(null);
  } else {
    const newJob = {
      ...formData,
      id: Date.now(),
      jobNo: `JB-${Math.floor(1000 + Math.random() * 9000)}`,
      submitDate: today, // ✅ captured at click time
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
  setFormData({
    jobName: '', ministry: 'Finance', department: 'Procurement', division: 'Administration',
    allocation: '', dateReq: '', ref: '', institute: ''
  });
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
      <div className="dashboard-container">
        
        {/* Updated Sidebar Match */}
        <aside className="sidebar">
          <div className="profile-box">
            <div className="profile-photo" style={{ overflow: 'hidden' }}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} />
              )}
            </div>
            <div className="profile-info">
              <h3>{profileName}</h3>
              <p className="reg-number">{regNo}</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'New Job' ? 'active' : ''}`} 
              onClick={() => setActiveTab('New Job')}
            >
              <Briefcase size={18} /> New Job
            </button>
            <button 
              className={`nav-item ${activeTab === 'Update Progress' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Update Progress')}
            >
              <RefreshCw size={18} /> Update Progress
            </button>
            <button 
              className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`} 
              onClick={() => {
                setActiveTab('Profile');
                handleProfileTabOpen();
              }}
            >
              <Edit3 size={18} /> Profile
            </button>
            <button 
              className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Settings')}
            >
              <Settings size={18} /> Settings
            </button>
            <button className="nav-item logout-nav-item" onClick={handleLogout}><LogOut size={18} /> Logout</button>
            
          </nav>
        </aside>

        {/* Content View wrapper logic inside main wrapper */}
        <main className="dashboard-content">
          <header className="content-header">
            <div className="header-left">
            </div>
          </header>

          {/* New Job Layout Context */}
          {activeTab === 'New Job' && (
            <section className="project-table-section">
              <div className="field-card">
                <div className="vertical-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="input-row-group">
  
  <label>Division <span style={{ color: "red" }}>*</span></label>
  <select
    name="division"
    value={formData.division}
    onChange={handleInputChange}
    className="job-select-dropdown" required 
  >
    
    <option value="Administration">Administration</option>
    <option value="Finance">Finance</option>
    <option value="Engineering">Engineering</option>
    <option value="Procurement">Procurement</option>
    <option value="Human Resources">Human Resources</option>
    <option value="Information Technology">Information Technology</option>
    <option value="Planning & Development">Planning & Development</option>
    <option value="Operations">Operations</option>
  </select>
</div>

<div className="form-row">
  <div className="input-row-group">
    <label>Job Name<span style={{ color: "red" }}>*</span></label>
    <input
      name="jobName"
      value={formData.jobName}
      onChange={handleInputChange}
      className="input-field" required 
    />
  </div>

  <div className="input-row-group">
    <label>Ministry <span style={{ color: "red" }}>*</span></label>
    <select
      name="ministry"
      value={formData.ministry}
      onChange={handleInputChange}
      className="job-select-dropdown"
      required
    >
      <option value="">Select Ministry</option>
      <option value="Finance">Finance</option>
      <option value="Education">Education</option>
      <option value="Health">Health</option>
    </select>
  </div>
</div>

                <div className="form-row">
                  <div className="input-row-group">
                    <label>Department <span style={{ color: "red" }}>*</span></label>
                    <select name="department" value={formData.department} onChange={handleInputChange} className="job-select-dropdown" required>
                      <option value="">Select Department</option>
                      <option value="Procurement">Procurement</option>
                      <option value="Engineering">Engineering</option>
                    </select>
                  </div>
                  <div className="input-row-group">
                    <label>Institute </label>
                    <input
                      name="institute"
                      value={formData.institute}
                      onChange={handleInputChange}
                      className="input-field" 
                    />
                  </div>
                  </div>
                  <div className="form-row">
                  <div className="input-row-group">
  <label>
    Allocation (Rs.) <span style={{ color: "red" }}>*</span>
  </label>

  <input
    name="allocation"
    value={formData.allocation}
    onChange={(e) => {
      let value = e.target.value;

      // remove commas first
      value = value.replace(/,/g, "");

      // allow only numbers + decimal
      if (!/^\d*\.?\d*$/.test(value)) return;

      handleInputChange({
        target: {
          name: "allocation",
          value,
        },
      });
    }}
    onBlur={(e) => {
      let value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        handleInputChange({
          target: {
            name: "allocation",
            value: value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          },
        });
      }
    }}
    className="input-field"
  />
</div>
                  <div className="input-row-group">
                    <label>Date of Request <span style={{ color: "red" }}>*</span></label>
                    <input name="dateReq" type="date" value={formData.dateReq} onChange={handleInputChange} className="input-field" required/>
                  </div>
                  </div>

                  <div className="form-row">
                  <div className="input-row-group">
                    <label>Request Letter Reference<span style={{ color: "red" }}>*</span></label>
                    <input name="ref" value={formData.ref} onChange={handleInputChange} className="input-field" required />
                  </div>
                  
                </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    className="save-btn"
                    onClick={handleAddJob}
                    disabled={!isFormValid()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      opacity: isFormValid() ? 1 : 0.4,
                      cursor: isFormValid() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Save size={16} /> {editingId ? 'Update' : 'OK'}
                  </button>
                  <button className="cancel-btn" onClick={handleCancel} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <X size={16} /> Canceln
                  </button>
                </div>

                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontWeight: 900 }}>Recent Jobs</h3>
                  <table className="project-table">
                    <thead>
                      <tr>
                        <th>Job No</th><th>Division</th><th>Job Name</th><th>Ministry</th><th>Department</th><th>Request Date</th><th>Allocation</th><th>Remark</th><th>Submit Date</th><th>Actions</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((j) => (
                        <tr key={j.id}>
                          <td className="font-mono text-cyan-500">{j.jobNo}</td>
                          <td>{j.division}</td>
                          <td className="font-bold">{j.jobName}</td>
                          <td>{j.ministry}</td>
                          <td>{j.department}</td>
                          <td>{j.dateReq}</td>
                          <td className="font-bold">{j.allocation}</td>
                          <td>{j.remark}</td>
                          <td>{j.submitDate}</td>
                          
                          <td>{j.action}
                          
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleEditJob(j)} style={{ background: '#f0f0f0', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Edit size={16} /></button>
                              <button onClick={() => handleDeleteJob(j.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                          </td>
                          <td>{j.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Fully Converted Profile Sub-tab View */}
          {activeTab === 'Profile' && (
            <section className="profile-view">
              <div className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="field-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                      <button onClick={() => fileInputRef.current.click()} style={{ position: 'absolute', bottom: '0', right: '0', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}><Camera size={16}/></button>
                    </div>
                    <h3>Personal Details</h3>
                  </div>
                  
                  <div className="input-row-group">
                    <label>FULL NAME</label>
                    <input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-row-group">
                    <label>REGISTRATION NUMBER</label>
                    <input type="text" value={editRegNo} onChange={(e) => setEditRegNo(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-row-group">
                    <label>EMAIL ADDRESS</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-row-group">
                    <label>PHONE NUMBER</label>
                    <input type="text" value={editPhoneNo} onChange={(e) => setEditPhoneNo(e.target.value)} className="input-field" />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                      className="save-btn"
                      onClick={handleAddJob}
                      disabled={!isFormValid()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        opacity: isFormValid() ? 1 : 0.4,
                        cursor: isFormValid() ? 'pointer' : 'not-allowed',
                      }}
>
                      <Save size={16} /> {editingId ? 'Update' : 'OK'}
                    </button>
                    <button className="cancel-btn" onClick={handleCancelProfile} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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