import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Briefcase, RefreshCw, User, Settings, X, Edit, Trash2,
  LogOut, Edit3, Camera, Menu, CheckCircle, XCircle, Clock,
  BarChart3, Wrench, Filter, Plus, AlertTriangle, Shield, Sun, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

/* ─── Ministry → Department mapping ─── */
const MINISTRY_DEPARTMENTS = {
  'CHIEF MINISTRY': [
    'DEPARTMENT OF EDUCATION',
    'DEPARTMENT OF CULTURAL AFFAIR',
    'DEPARTMENT OF SPORTS-NCP',
  ],
  'MINISTRY OF AGRICULTURE': [
    'DEPARTMENT OF AGRICULTURE',
    'DEPARTMENT OF ANIMAL PRODUCTION & HEALTH',
    'DEPARTMENT OF IRRIGATION DEPARTMENT',
  ],
  'MINISTRY OF HEALTH': [
    'DEPARTMENT OF HEALTH',
    'DEPARTMENT OF AYURVEDA',
    'DEPARTMENT OF PROBATION & CHILD CARE',
    'DEPARTMENT OF SOCIAL WELFARE',
  ],
  'MINISTRY OF CO-OPERATIVE': [
    'DEPARTMENT OF CO-OPERATIVE DEVELOPMENT',
    'DEPARTMENT OF INDUSTRIAL DEVELOPMENT',
    'PROVINCIAL MOTOR VEHICLE TRANSPORT DEPARTMENT',
    'ROAD PASSENGER TRANSPORT SERVICE AUTHORITY',
  ],
  'MINISTRY OF LOCAL GOVERNMENT': [
    'DEPARTMENT OF LOCAL GOVERNMENT',
    'DEPARTMENT OF RURAL DEVELOPMENT',
    'PROVINCIAL ROAD DEVELOPMENT AUTHORITY',
  ],
  'OTHER': [
    'CHIEF SECRETARY OFFICE',
    'DEPARTMENT OF TREASURY',
    'DEPARTMENT OF PLANNING',
    'DEPARTMENT OF PROVINCIAL ENGINEERING',
    'INTERNAL AUDIT & INVESTIGATION',
    'DEPARTMENT OF PROVINCIAL REVENUE',
    'DEPARTMENT OF OTHER',
  ],
};

/* ─── Animation variants ─── */
const pageVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } }
};

const cardVariant = {
  hidden:  { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
};

/* ─────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeTab, setActiveTab] = useState('New Job');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jobName: '', ministry: '', department: '', division: '',
    allocation: '', dateReq: '', ref: '', institute: ''
  });

  const [filters, setFilters] = useState({ department: '', ministry: '', division: '' });

  /* ─── Toast system ─── */
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    addToast(`${nextDark ? 'Dark' : 'Light'} theme activated`, 'info');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const nextFilters = { ...prev, [name]: value };
      if (name === 'ministry') {
        const allowedDepts = MINISTRY_DEPARTMENTS[value] || [];
        if (value && prev.department && !allowedDepts.includes(prev.department)) {
          nextFilters.department = '';
        }
      }
      return nextFilters;
    });
  };

  const fetchData = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/projects/all');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
        const user = res.data;
        if (user) {
          setProfileName(user.fullName || 'User');
          setRegNo(user.employeeId || '');
          setEmail(user.email || '');
          setPhoneNo(user.phoneNo || '');
          setProfilePic(user.profilePic || null);

          localStorage.setItem('fullName', user.fullName || '');
          localStorage.setItem('employeeId', user.employeeId || '');
          localStorage.setItem('email', user.email || '');
          localStorage.setItem('phoneNo', user.phoneNo || '');
          localStorage.setItem('profilePic', user.profilePic || '');
        }
      }
    } catch (err) {
      console.error("Error fetching admin profile:", err);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchUserProfile();
  }, []);

  const [profileName, setProfileName] = useState(localStorage.getItem('fullName') || 'John Doe');
  const [regNo, setRegNo] = useState(localStorage.getItem('employeeId') || 'REG/2021/CS/088');
  const [email, setEmail] = useState(localStorage.getItem('email') || 'john.doe@example.com');
  const [phoneNo, setPhoneNo] = useState(localStorage.getItem('phoneNo') || '071-2345678');
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);
  const [editProfileName, setEditProfileName] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNo, setEditPhoneNo] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ministry') {
      const firstDept = MINISTRY_DEPARTMENTS[value]?.[0] || '';
      setFormData({ ...formData, ministry: value, department: firstDept });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleProfileTabOpen = () => {
    setEditProfileName(profileName);
    setEditRegNo(regNo);
    setEmail(email);
    setPhoneNo(phoneNo);
  };

  const handleConfirmProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        addToast("User session not found", "error");
        return;
      }
      const payload = {
        fullName: editProfileName,
        email: editEmail,
        phoneNo: editPhoneNo
      };
      const res = await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/profile`, payload);
      if (res.data) {
        setProfileName(editProfileName);
        setRegNo(editRegNo);
        setEmail(editEmail);
        setPhoneNo(editPhoneNo);

        localStorage.setItem('fullName', editProfileName);
        localStorage.setItem('employeeId', editRegNo);
        localStorage.setItem('email', editEmail);
        localStorage.setItem('phoneNo', editPhoneNo);

        addToast("Profile saved successfully!", "success");
      }
    } catch (err) {
      console.error("Error updating admin profile:", err);
      addToast(err.response?.data?.error || "Failed to update profile", "error");
    }
  };

  const handleCancelProfile = () => {
    setActiveTab('New Job');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.clear();
    navigate('/');
  };

  const isFormValid = () => {
    const { division, jobName, ministry, department, allocation, dateReq, ref } = formData;
    return !!(division && jobName && ministry && department && allocation && dateReq && ref);
  };

  const handleAddJob = async () => {
    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:5000/api/projects/update/${editingId}`, formData);
        addToast('Job updated successfully!', 'success');
      } else {
        await axios.post('http://127.0.0.1:5000/api/projects/add', formData);
        addToast('New job created successfully!', 'success');
      }
      const res = await axios.get('http://127.0.0.1:5000/api/projects/all');
      setJobs(res.data);
      handleCancel();
    } catch (err) {
      console.dir(err);
      if (err.response) {
        addToast('Server error: ' + JSON.stringify(err.response.data), 'error');
      } else {
        addToast('Error: ' + err.message, 'error');
      }
    }
  };

  const handleDeleteJob = async (jobNo) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/projects/delete/${jobNo}`);
        await fetchData();
        addToast('Job deleted successfully!', 'success');
      } catch (error) {
        console.error("Delete Error:", error);
        addToast('Delete failed! Check console.', 'error');
      }
    }
  };

  const handleEditJob = (job) => {
    setEditingId(job._id);
    setFormData(job);
    addToast('Editing job: ' + job.jobNo, 'info');
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      jobName: '', ministry: '', department: '', division: '',
      allocation: '', dateReq: '', ref: '', institute: ''
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        setProfilePic(base64Data);
        localStorage.setItem('profilePic', base64Data);

        try {
          const userId = localStorage.getItem('userId');
          if (userId) {
            await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/profile`, {
              profilePic: base64Data
            });
            addToast("Profile photo updated successfully!", "success");
          }
        } catch (err) {
          console.error("Error saving admin profile photo to backend:", err);
          addToast("Failed to sync photo to database", "error");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getUniqueValues = (key) => {
    const values = jobs.map((j) => j[key]).filter((v) => v !== undefined && v !== null && v !== '');
    return [...new Set(values)].sort();
  };

  const ministryOptions = [...new Set([
    ...Object.keys(MINISTRY_DEPARTMENTS),
    ...getUniqueValues('ministry')
  ])].sort();

  const divisionOptions = [...new Set([
    'Anuradhapura-East',
    'Anuradhapura-West',
    'Medawachchiya',
    'Mihinthale',
    'Kekirawa',
    'Thabuththegama',
    'Polonnaruwa',
    'Higurakgoda',
    ...getUniqueValues('division')
  ])].sort();

  const departmentOptions = filters.ministry
    ? [...new Set([
        ...(MINISTRY_DEPARTMENTS[filters.ministry] || []),
        ...jobs.filter(j => j.ministry === filters.ministry).map(j => j.department).filter(Boolean)
      ])].sort()
    : [...new Set([
        ...Object.values(MINISTRY_DEPARTMENTS).flat(),
        ...getUniqueValues('department')
      ])].sort();

  const filteredJobs = jobs.filter((j) => {
    if (filters.department && j.department !== filters.department) return false;
    if (filters.ministry && j.ministry !== filters.ministry) return false;
    if (filters.division && j.division !== filters.division) return false;
    return true;
  });

  const handleClearFilters = () => {
    setFilters({ department: '', ministry: '', division: '' });
  };

  const availableDepartments = MINISTRY_DEPARTMENTS[formData.ministry] || [];

  /* ─── Computed stats ─── */
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => !j.status || j.status === 'Pending').length;
  const approvedJobs = jobs.filter(j => j.status === 'Approved').length;
  const rejectedJobs = jobs.filter(j => j.status === 'Rejected').length;

  const statCards = [
    { label: 'Total Jobs',  value: totalJobs,   icon: Briefcase,   color: 'var(--accent-primary)' },
    { label: 'Pending',     value: pendingJobs,  icon: Clock,       color: 'var(--warning)' },
    { label: 'Approved',    value: approvedJobs, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Rejected',    value: rejectedJobs, icon: XCircle,     color: 'var(--danger)' },
  ];

  return (
    <div id="cems-user-dashboard" className={isDark ? 'dark-mode' : 'light-mode'}>
      {/* Hamburger */}
      <button
        className="sidebar-toggle-menu-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}
      >
        <Menu size={20} />
      </button>

      <div className="user-dashboard-layout">
        {/* ─── Sidebar ─── */}
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-box">
            <div className="profile-photo">
              {profilePic ? (
                <img src={profilePic} alt="Profile" />
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
            {[
              { id: 'New Job',         icon: Plus,      label: 'New Job' },
              { id: 'Update Progress', icon: RefreshCw, label: 'Update Progress' },
              { id: 'Profile',         icon: Edit3,     label: 'Profile' },
              { id: 'Settings',        icon: Settings,  label: 'Settings' },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'Profile') handleProfileTabOpen();
                }}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}

            {/* Dark Mode Switch in Sidebar */}
            <button className="nav-item" onClick={toggleDarkMode} style={{ marginTop: '20px', borderTop: '1px solid var(--border-base)', paddingTop: '15px' }}>
              {isDark ? <Sun size={18} style={{ color: '#d97706' }} /> : <Moon size={18} style={{ color: '#8b5cf6' }} />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button className="nav-item logout-nav-item" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </aside>

        {/* ─── Main Content ─── */}
        <main className={`dashboard-content ${isSidebarOpen ? 'content-shifted-open' : 'content-shifted-closed'}`}>
          <header className="content-header">
            <div className="header-left" />
          </header>

          {/* ─── Stat Cards ─── */}
          <motion.div
            className="stat-cards-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}
          >
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={cardVariant}
                className="field-card"
                style={{ padding: '20px', cursor: 'default', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
                  }}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ─── Tab Content ─── */}
          <AnimatePresence mode="wait">
            {activeTab === 'New Job' && (
              <motion.section
                key="new-job"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="project-table-section"
              >
                {/* ── Job Form ── */}
                <div className="field-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>
                      {editingId ? 'Edit Job' : 'Create New Job'}
                    </h3>
                  </div>

                  <div className="vertical-form">
                    <div className="input-row-group">
                      <label>Division <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                      <select
                        name="division"
                        value={formData.division}
                        onChange={handleInputChange}
                        className="job-select-dropdown" required
                      >
                        <option value="" disabled>Select Division</option>
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
                        <label>Job Name <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                        <input
                          name="jobName"
                          value={formData.jobName}
                          onChange={handleInputChange}
                          className="input-field" required
                        />
                      </div>
                      <div className="input-row-group">
                        <label>Ministry <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                        <select
                          name="ministry"
                          value={formData.ministry}
                          onChange={handleInputChange}
                          className="job-select-dropdown" required
                        >
                          <option value="" disabled>Select Ministry</option>
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
                        <label>Department <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                        <select name="department" value={formData.department} onChange={handleInputChange} className="job-select-dropdown" required>
                          {availableDepartments.length === 0 ? (
                            <option value="">Select a ministry first</option>
                          ) : (
                            availableDepartments.map((dept) => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))
                          )}
                        </select>
                      </div>
                      <div className="input-row-group">
                        <label>Institute</label>
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
                        <label>Allocation (Rs.) <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
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
                        <label>Date of Request <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                        <input name="dateReq" type="date" value={formData.dateReq} onChange={handleInputChange} className="input-field" required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-row-group">
                        <label>Request Letter Reference <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                        <input name="ref" value={formData.ref} onChange={handleInputChange} className="input-field" required />
                      </div>
                    </div>
                  </div>

                  <div className="form-action-row">
                    <button className="save-btn" onClick={handleAddJob} disabled={!isFormValid()}>
                      <Save size={14} /> {editingId ? 'Update' : 'OK'}
                    </button>
                    <button className="cancel-btn" onClick={handleCancel}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>

                {/* ── Jobs Table ── */}
                <motion.div
                  className="recent-jobs-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <h3 className="recent-jobs-title">Recent Jobs</h3>

                  <div className="table-filters-row">
                    <div className="input-row-group">
                      <label><Filter size={12} /> Filter by Ministry</label>
                      <select name="ministry" value={filters.ministry} onChange={handleFilterChange} className="input-field">
                        <option value="">All Ministries</option>
                        {ministryOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-row-group">
                      <label><Filter size={12} /> Filter by Department</label>
                      <select name="department" value={filters.department} onChange={handleFilterChange} className="input-field">
                        <option value="">All Departments</option>
                        {departmentOptions.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-row-group">
                      <label><Filter size={12} /> Filter by Division</label>
                      <select name="division" value={filters.division} onChange={handleFilterChange} className="input-field">
                        <option value="">All Divisions</option>
                        {divisionOptions.map((dv) => (
                          <option key={dv} value={dv}>{dv}</option>
                        ))}
                      </select>
                    </div>

                    {(filters.department || filters.ministry || filters.division) && (
                      <button className="cancel-btn" onClick={handleClearFilters}>
                        <X size={14} /> Clear
                      </button>
                    )}
                  </div>

                  <div className="table-scroll-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Job No</th><th>Division</th><th>Job Name</th><th>Ministry</th><th>Department</th><th>Institute</th><th>Request Date</th><th>Allocation</th><th>Remark</th><th>Submit Date</th><th>Actions</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.length === 0 ? (
                          <tr>
                            <td colSpan={12}>
                              <div className="placeholder-content" style={{ height: '160px', border: 'none' }}>
                                <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                                <span>{jobs.length === 0 ? 'No jobs added yet.' : 'No jobs match the selected filters.'}</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredJobs.map((j) => (
                            <tr key={j._id} className={j.status === 'Rejected' ? 'row-rejected' : ''}>
                              <td className="font-mono">{j.jobNo}</td>
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
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button className="approve-btn" onClick={() => handleEditJob(j)} title="Edit">
                                    <Edit size={15} />
                                  </button>
                                  <button className="reject-btn" onClick={() => handleDeleteJob(j.jobNo)} title="Delete">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                              <td>
                                <span className={`status-badge status-${j.status ? j.status.toLowerCase() : 'pending'}`}>
                                  {j.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.section>
            )}

            {activeTab === 'Profile' && (
              <motion.section
                key="profile"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="profile-view"
              >
                <div className="field-card" style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div className="profile-photo" style={{ width: '80px', height: '80px', position: 'relative' }}>
                      {profilePic ? <img src={profilePic} alt="Profile" /> : <User size={36} />}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                      <button
                        className="approve-btn"
                        onClick={() => fileInputRef.current.click()}
                        style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '28px', height: '28px', borderRadius: '50%', padding: 0 }}
                      >
                        <Camera size={13} />
                      </button>
                    </div>
                    <div>
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Personal Details</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Update your profile information</p>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-row-group">
                      <label>Full Name</label>
                      <input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} className="input-field" />
                    </div>
                    <div className="input-row-group">
                      <label>Registration Number</label>
                      <input type="text" value={editRegNo} onChange={(e) => setEditRegNo(e.target.value)} className="input-field" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-row-group">
                      <label>Email Address</label>
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field" />
                    </div>
                    <div className="input-row-group">
                      <label>Phone Number</label>
                      <input type="text" value={editPhoneNo} onChange={(e) => setEditPhoneNo(e.target.value)} className="input-field" />
                    </div>
                  </div>

                  <div className="form-action-row">
                    <button className="save-btn" onClick={handleConfirmProfile}>
                      <Save size={14} /> Save
                    </button>
                    <button className="cancel-btn" onClick={handleCancelProfile}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'Update Progress' && (
              <motion.div
                key="update-progress"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="placeholder-content"
              >
                <BarChart3 size={36} style={{ opacity: 0.35 }} />
                <p>Update Progress — coming soon</p>
              </motion.div>
            )}

            {activeTab === 'Settings' && (
              <motion.section
                key="settings"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="profile-view"
              >
                <div className="field-card" style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>System Settings</h3>
                  </div>
                  <div className="vertical-form">
                    <div className="input-row-group">
                      <label>Theme Preferences</label>
                      <select
                        value={isDark ? 'Dark Mode' : 'Light Mode'}
                        onChange={(e) => {
                          const nextDark = e.target.value === 'Dark Mode';
                          setIsDark(nextDark);
                          localStorage.setItem('theme', nextDark ? 'dark' : 'light');
                        }}
                        className="job-select-dropdown"
                      >
                        <option value="Light Mode">Light Mode</option>
                        <option value="Dark Mode">Dark Mode</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ─── Toast Notifications ─── */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`alert-banner alert-${toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'success'}`}
              style={{ pointerEvents: 'all', minWidth: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            >
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'error' && <XCircle size={18} />}
              {toast.type === 'info' && <AlertTriangle size={18} />}
              <span style={{ flex: 1, fontSize: '0.85rem' }}>{toast.message}</span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px', display: 'flex' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;