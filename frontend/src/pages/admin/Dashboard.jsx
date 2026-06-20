import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Save, Briefcase, RefreshCw, User, Settings, X, Edit, Trash2, LogOut, Edit3, Camera, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('New Job');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jobName: '', ministry: 'Finance', department: 'Procurement', division: 'Administration',
    allocation: '', dateReq: '', ref: '', institute: ''
  });

  // FIXED: Moved fetchData outside of useEffect so it can be called by handleDeleteJob
  const fetchData = async () => { 
    try { 
      const res = await axios.get('http://127.0.0.1:5000/api/projects/all'); 
      setJobs(res.data); 
    } catch (err) { 
      console.error(err); 
    } 
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const [profileName, setProfileName] = useState('John Doe');
  const [regNo, setRegNo] = useState('REG/2021/CS/088');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phoneNo, setPhoneNo] = useState('071-2345678');
  const [profilePic, setProfilePic] = useState(null);
  const [editProfileName, setEditProfileName] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNo, setEditPhoneNo] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const isFormValid = () => {
    const { division, jobName, ministry, department, allocation, dateReq, ref } = formData;
    return !!(division && jobName && ministry && department && allocation && dateReq && ref);
  };
  const handleAddJob = async () => {
    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:5000/api/projects/update/${editingId}`, formData);
      } else {
        await axios.post('http://127.0.0.1:5000/api/projects/add', formData);
      }
      const res = await axios.get('http://127.0.0.1:5000/api/projects/all');
      setJobs(res.data);
      handleCancel();
    } catch (err) {
      // FORCE A FULL LOG TO THE CONSOLE
      console.dir(err); 
      if (err.response) {
        console.log("THE SERVER SENT THIS:", err.response.data);
        alert("Server said: " + JSON.stringify(err.response.data));
      } else {
        alert("Error: " + err.message);
      }
    }
  };

  // Ensure this is in your AdminDashboard.jsx
  const handleDeleteJob = async (jobNo) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/projects/delete/${jobNo}`);
        // Refresh the list immediately so the UI matches the DB
        await fetchData(); 
        alert("Job deleted successfully!");
      } catch (error) {
        console.error("Delete Error:", error);
        console.log(error.response);
        alert("Delete failed! Check console.");
      }
    }
  };
  

  const handleEditJob = (job) => {
    setEditingId(job._id);
    setFormData(job);
  };

  const [userFormData, setUserFormData] = useState({
  fullName: '', // Changed from firstName/secondName
  employeeId: '',
  email: '',
  password: '',
  division: '',
  role: 'engineer' // Add this as a default
   });
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
      <button
        className="sidebar-toggle-menu-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}
      >
        <Menu size={20} />
      </button>

      <div className="user-dashboard-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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

        <main className={`dashboard-content ${isSidebarOpen ? 'content-shifted-open' : 'content-shifted-closed'}`}>
          <header className="content-header">
            <div className="header-left">
            </div>
          </header>

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
                      style={{ width: '49%' }}
                      className="job-select-dropdown" required
                    >
                      <option value="Anuradhapura-East">Anuradhapura-East</option>
                      <option value="Anuradhapura-West">Anuradhapura-West</option>
                      <option value="Medawachchiya">Medawachchiya</option>
                      <option value="Mihinthale">Mihinthale</option>
                      <option value="Kekirawa">Kekirawa</option>
                      <option value="Thabuththegama">Thabuththegama</option>
                      <option value="Polonnaruwa">Polonnaruwa</option>
                      <option value="Higurakgoda">Higurakgoda</option>
                      
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
                        <option value="CHIEF MINISTRY">CHIEF MINISTRY</option>
                        <option value="MINISTRY OF AGRICULTURE">MINISTRY OF AGRICULTURE</option>
                        <option value="MINISTRY OF HEALTH">MINISTRY OF HEALTH</option>
                        <option value="MINISTRY OF CO-OPERATIVE">MINISTRY OF CO-OPERATIVE</option>
                        <option value="MINISTRY OF LOCAL GOVERNMENT">MINISTRY OF LOCAL GOVERNMENT</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-row-group">
                      <label>Department <span style={{ color: "red" }}>*</span></label>
                      <select name="department" value={formData.department} onChange={handleInputChange} className="job-select-dropdown" required>
                        
                        <option value="Dept. Of EDUCATION">Dept. of EDUCATION</option>
                        <option value="Dept. Of CULTURAL AFFAIR">Dept. of CULTURAL AFFAIR</option>
                        <option value="Dept. of SPORTS">Dept. of SPORTS</option>
                        
                        <option value="Dept. of AGRICULTURE">Dept. of AGRICULTURE</option>
                        <option value="Dept. of ANIMAL PRODUCTION & HEALTH">Dept. of ANIMAL PRODUCTION & HEALTH</option>
                        <option value="Dept. Of IRRIGATION">Dept. Of IRRIGATION</option>

                        <option value="Dept. Of HEALTH">Dept. Of HEALTH</option>
                        <option value="Dept. Of AYURVEDA">Dept. Of AYURVEDA</option>
                        <option value="Dept. Of PROBATION & CHILD CARE">Dept. Of PROBATION & CHILD CARE</option>
                        <option value="Dept. Of SOCIAL WELFARE">Dept. Of SOCIAL WELFARE</option>

                        <option value="Dept. Of CO-OPERATIVE DEVELOPMENT">Dept. Of CO-OPERATIVE DEVELOPMENT</option>
                        <option value="Dept. Of INDUSTRIAL DEVELOPMENT">Dept. Of INDUSTRIAL DEVELOPMENT</option>
                        <option value="Dept. Of MOTOR VEHICLE TRSANSPORT">Dept. Of MOTOR VEHICLE TRANSPORT</option>
                        <option value="ROAD PASSENGER TRANSPORT SERVICE AUTHORITY">ROAD PASSENGER TRANSPORT SERVICE AUTHORITY</option>
                        
                        <option value="Dept. Of LOCAL GOVERNMENT">Dept. Of LOCAL GOVERNMENT</option>
                        <option value="Dept. Of RURAL DEVELOPMENT">Dept. Of RURAL DEVELOPMENT</option>
                        <option value="ROAD DEVELOPMENT AUTHORITY">ROAD DEVELOPMENT AUTHORITY</option>
                        
                        <option value="CHIEF SECRETARY OFFICE">CHIEF SECRETARY OFFICE</option>
                        <option value="Dept. Of TREASURY">Dept. Of TREASURY</option>
                        <option value="Dept. Of PLANNING">Dept. Of PLANNING</option>
                        <option value="Dept. Of ENGINEERING">Dept. Of ENGINEERING</option>
                        <option value="INTERNAL AUDIT & INVESTIGATION">INTERNAL AUDIT & INVESTIGATION</option>
                        <option value="Dept. Of REVENUE">Dept. of REVENUE</option>
                        <option value="Dept. Of OTHER">OTHER</option>

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
                          value = value.replace(/,/g, "");
                          if (!/^\d*\.?\d*$/.test(value)) return;
                          handleInputChange({ target: { name: "allocation", value } });
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
                      <input name="dateReq" type="date" value={formData.dateReq} onChange={handleInputChange} className="input-field" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-row-group">
                      <label>Request Letter Reference<span style={{ color: "red" }}>*</span></label>
                      <input name="ref" value={formData.ref} onChange={handleInputChange} className="input-field" required />
                    </div>
                  </div>
                </div>

                <div className="form-action-row">
                  <button
                    className="save-btn"
                    onClick={handleAddJob}
                    disabled={!isFormValid()}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Save size={14} /> {editingId ? 'Update' : 'OK'}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={handleCancel}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>

              <div className="recent-jobs-card">
                <h3 className="recent-jobs-title">Recent Jobs</h3>
                <div className="table-scroll-wrapper">
                  <table className="project-table">
                    <thead>
                      <tr>
                        <th>Job No</th><th>Division</th><th>Job Name</th><th>Ministry</th><th>Department</th><th>Institute</th><th>Request Date</th><th>Allocation</th><th>Remark</th><th>Submit Date</th><th>Actions</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.length === 0 ? (
                        <tr>
                          <td colSpan={12} style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                            No jobs added yet.
                          </td>
                        </tr>
                      ) : (
                        jobs.map((j) => (
                          <tr key={j._id}>
                            <td className="font-mono text-cyan-500">{j.jobNo}</td>
                            <td>{j.division}</td>
                            <td className="font-bold">{j.jobName}</td>
                            <td>{j.ministry}</td>
                            <td>{j.department}</td>
                            <td>{j.institute}</td>
                            <td>{j.dateReq ? j.dateReq.split('T')[0] : 'N/A'}</td>
                            <td className="font-bold">{j.allocation}</td>
                            <td>{j.remark}</td>
                            <td>{j.submitDate ? j.submitDate.split('T')[0] : 'N/A'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleEditJob(j)} style={{ background: '#dbeafe', color: '#2563eb', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Edit size={16} /></button>
                                <button onClick={() => handleDeleteJob(j.jobNo)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                              </div>
                            </td>
                            <td>{j.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Profile' && (
            <section className="profile-view">
              <div className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="field-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifycontent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                      <button onClick={() => fileInputRef.current.click()} style={{ position: 'absolute', bottom: '0', right: '0', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}><Camera size={16} /></button>
                    </div>
                    <h3>Personal Details</h3>
                  </div>

                  <div className="input-row-group">
                    <label>FULL NAME *</label>
                      <input name="fullName" value={userFormData.fullName} onChange={handleUserFormChange} />

                      <label>ROLE</label>
                      <select name="role" value={userFormData.role} onChange={handleUserFormChange}>
                        <option value="engineer">Engineer</option>
                        <option value="admin">Admin</option>
                      </select>
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
                      onClick={handleConfirmProfile}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      <Save size={14} /> Save
                    </button>
                    <button className="cancel-btn" onClick={handleCancelProfile} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
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