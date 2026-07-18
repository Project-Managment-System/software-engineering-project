import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, RefreshCw, Settings, Save, Edit3, Camera, LogOut, Menu,
  Send, Calendar, Sun, Moon, Clock, CheckCircle, XCircle, AlertTriangle, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

/* ─── Role Formatting Helpers ─── */
const formatRoleName = (role) => {
  if (!role) return 'N/A';
  switch (role.toLowerCase()) {
    case 'admin': return 'Admin';
    case 'engineer': return 'Engineer';
    case 'division_assistant': return 'Division Assistant';
    case 'user': return 'User';
    case 'clerk': return 'Clerk';
    default: return role;
  }
};

/* ─────────────────────────────────────── */
const UserDashboard = () => {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [selectedJobId, setSelectedJobId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [estimateAmount, setEstimateAmount] = useState('');

  const [profileName, setProfileName] = useState(localStorage.getItem('fullName') || 'User');
  const [regNo, setRegNo] = useState(localStorage.getItem('employeeId') || 'REG/2021/CS/088');
  const [email, setEmail] = useState(localStorage.getItem('email') || 'user@cems.local');
  const [phoneNo, setPhoneNo] = useState(localStorage.getItem('phoneNo') || '071-2345678');
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);
  const [userDivision, setUserDivision] = useState(localStorage.getItem('userDivision') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'user');

  const [editProfileName, setEditProfileName] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNo, setEditPhoneNo] = useState('');

  const [editableJobName, setEditableJobName] = useState('');
  const [editableAllocation, setEditableAllocation] = useState('');
  const [editableAssignDate, setEditableAssignDate] = useState('');
  const [editableDeadline, setEditableDeadline] = useState('');

  const [submittedEstimates, setSubmittedEstimates] = useState([]);
  const [jobData, setJobData] = useState([]);

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

  const fetchData = async () => {
    try {
      const division = localStorage.getItem('userDivision');
      if (division) {
        const res = await axios.get(`http://127.0.0.1:5000/api/projects/division/${division}`);
        setJobData(res.data.map((item, index) => ({
          ...item,
          sNo: index + 1,
          assignDate: item.dateReq ? new Date(item.dateReq).toISOString().split('T')[0] : 'N/A',
          deadline: item.submitDate ? new Date(item.submitDate).toISOString().split('T')[0] : 'N/A'
        })));
      }
    } catch (err) {
      console.error("Error fetching user division projects:", err);
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
          if (user.division) {
            setUserDivision(user.division);
            localStorage.setItem('userDivision', user.division);
          }
          if (user.role) {
            setUserRole(user.role);
            localStorage.setItem('role', user.role);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (isAuth !== 'true') {
      navigate('/');
    }
    fetchData();
    fetchUserProfile();
  }, [navigate]);

  const handleCheckEstimate = (estimateNo) => {
    setSubmittedEstimates(submittedEstimates.map(est => 
      est.no === estimateNo ? { ...est, isChecked: !est.isChecked } : est
    ));
    addToast("Estimate status updated!", "info");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate('/');
    }
  };

  const handleProfileTabOpen = () => {
    setEditProfileName(profileName);
    setEditRegNo(regNo);
    setEditEmail(email);
    setEditPhoneNo(phoneNo);
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
      console.error("Error updating profile:", err);
      addToast(err.response?.data?.error || "Failed to update profile", "error");
    }
  };

  const handleCancelProfile = () => {
    setActiveTab('my-jobs');
  };

  // Only show jobs specifically assigned to this logged-in user
  const myJobs = jobData.filter(job => job.assignee && job.assignee === profileName);

  const selectedJob = myJobs.find(job => job.jobNo === selectedJobId);

  const handleSelectionChange = (id) => {
    setSelectedJobId(id);
    const foundJob = myJobs.find(j => j.jobNo === id);
    if (foundJob) {
      setEditableJobName(foundJob.jobName);
      setEditableAllocation(foundJob.allocation);
      setEditableAssignDate(foundJob.assignDate);
      setEditableDeadline(foundJob.deadline);
    }
  };

  const handleSaveJob = async () => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${selectedJobId}`, {
        jobName: editableJobName,
        allocation: editableAllocation,
      });
      addToast("Job details saved successfully!", "success");
      fetchData();
    } catch (err) {
      addToast("Failed to save changes", "error");
    }
  };

  const handleSubmitEstimate = () => {
    if (!selectedJobId || !visitDate || !estimateAmount) {
      addToast("Please fill in all fields", "warning");
      return;
    }
    const newEstimate = {
      no: submittedEstimates.length + 1,
      jobNo: selectedJob.jobNo,
      jobName: selectedJob.jobName,
      toName: profileName,
      allocation: selectedJob.allocation,
      estimatedAmount: estimateAmount,
      checkedOn: visitDate,
      sendApproval: "Pending",
      isChecked: false
    };
    setSubmittedEstimates([...submittedEstimates, newEstimate]);
    setVisitDate('');
    setEstimateAmount('');
    addToast("Estimate submitted to OA", "success");
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current.focus();
    }
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
          console.error("Error saving profile photo to backend:", err);
          addToast("Failed to sync photo to database", "error");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEstimateAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setEstimateAmount(value);
    }
  };

  const handleEstimateAmountKeyDown = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  /* ─── Computed stats ─── */
  const totalMyJobs = myJobs.length;
  const totalSubmittedEstimates = submittedEstimates.length;
  const pendingApprovalsCount = myJobs.filter(j => !j.status || j.status === 'Pending').length;

  const statCards = [
    { label: 'My Jobs',            value: totalMyJobs,             icon: Briefcase, color: 'var(--accent-primary)' },
    { label: 'Estimates Sent',     value: totalSubmittedEstimates, icon: Send,      color: 'var(--accent-2)' },
    { label: 'Pending Approvals',  value: pendingApprovalsCount,   icon: Clock,     color: 'var(--warning)' },
  ];

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

      <div className="dashboard-container">
        {/* ─── Sidebar ─── */}
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-box">
            <div className="profile-photo">
              {profilePic ? <img src={profilePic} alt="Profile" /> : <User size={48} />}
            </div>
            <div className="profile-info">
              {userDivision && (
                <span className="profile-division" style={{
                  fontSize: '0.7rem',
                  color: 'var(--accent-primary)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '2px',
                  display: 'block'
                }}>
                  {userDivision}
                </span>
              )}
              <h3>{profileName}</h3>
              <p className="reg-number">{regNo}</p>
              <span className="role-title" style={{
                fontSize: '0.68rem',
                color: '#ffffff',
                backgroundColor: 'var(--accent-primary)',
                fontWeight: '800',
                padding: '3px 10px',
                borderRadius: '12px',
                marginTop: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-block'
              }}>
                {formatRoleName(userRole || 'user')}
              </span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {[
              { id: 'my-jobs',         icon: Briefcase, label: 'My Jobs' },
              { id: 'update-progress', icon: RefreshCw, label: 'Update Progress' },
              { id: 'profile',         icon: Edit3,     label: 'Profile' },
              { id: 'settings',        icon: Settings,  label: 'Settings' },
            ].map(item => (
              <button 
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'profile') handleProfileTabOpen();
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
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}
          >
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                variants={cardVariant}
                className="field-card"
                style={{ padding: '20px', cursor: 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
                  }}>
                    <stat.icon size={19} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        
          <AnimatePresence mode="wait">
            {/* ── My Jobs Tab ── */}
            {activeTab === 'my-jobs' && (
              <motion.section key="my-jobs" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="project-table-section">
                <div className="field-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Briefcase size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>My Division Allocated Jobs</h3>
                  </div>
                  <div className="table-scroll-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Serial No</th>
                          <th>Job No</th>
                          <th>Job Name</th>
                          <th>Allocation</th>
                          <th>Assign Date</th>
                          <th>Timeline Limit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myJobs.length === 0 ? (
                          <tr>
                            <td colSpan={6}>
                              <div className="placeholder-content" style={{ height: '120px', border: 'none' }}>
                                <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                                <span>No jobs assigned to you yet.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          myJobs.map((job, index) => (
                            <tr key={job.jobNo}>
                              <td>{index + 1}</td>
                              <td className="font-mono">{job.jobNo}</td>
                              <td className="font-bold">{job.jobName}</td>
                              <td>{job.allocation}</td>
                              <td>{job.assignDate}</td>
                              <td>
                                <span className="deadline-tag">{job.deadline}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.section>
            )}



            {/* ── Update Progress Tab ── */}
            {activeTab === 'update-progress' && (
              <motion.section key="update-progress" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="update-progress-view">
                <div className="field-card" style={{ marginBottom: '24px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <RefreshCw size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>Select Active Job to Update</h3>
                  </div>
                  <div className="vertical-form">
                    <div className="input-row-group">
                      <label>Job Directory Reference</label>
                      <select 
                        className="job-select-dropdown" 
                        value={selectedJobId} 
                        onChange={(e) => handleSelectionChange(e.target.value)}
                      >
                        <option value="">-- Choose Job ID --</option>
                        {myJobs.map(job => (
                          <option key={job.jobNo} value={job.jobNo}>{job.jobNo} - {job.jobName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {selectedJob && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    
                    {/* Column 1: Core Job Specs */}
                    <div className="field-card" style={{ padding: '24px' }}>
                      <p className="instruction-text" style={{ marginTop: '0px', marginBottom: '20px', fontWeight: 600 }}>Update structural specifications:</p>
                      <div className="vertical-form">
                        <div className="input-row-group">
                          <label>Job Reference Code</label>
                          <input type="text" disabled value={selectedJob.jobNo} className="input-field disabled" />
                        </div>
                        <div className="input-row-group">
                          <label>Job Description</label>
                          <input type="text" value={editableJobName} onChange={(e) => setEditableJobName(e.target.value)} className="input-field" />
                        </div>
                        <div className="input-row-group">
                          <label>Allocation Area</label>
                          <input type="text" value={editableAllocation} onChange={(e) => setEditableAllocation(e.target.value)} className="input-field" />
                        </div>
                        <div className="input-row-group">
                          <label>Work Allocation Date</label>
                          <input type="date" value={editableAssignDate} onChange={(e) => setEditableAssignDate(e.target.value)} className="input-field" />
                        </div>
                        <div className="input-row-group">
                          <label>Deadline Limit</label>
                          <input type="date" value={editableDeadline} onChange={(e) => setEditableDeadline(e.target.value)} className="input-field" />
                        </div>
                        <button className="save-btn" onClick={handleSaveJob} style={{ marginTop: '10px' }}>
                          <Save size={16} /> Save Changes
                        </button>
                      </div>
                    </div>

                    {/* Column 2: Estimates Submission */}
                    <div className="field-card" style={{ padding: '24px' }}>
                      <p className="instruction-text" style={{ marginTop: '0px', marginBottom: '20px', fontWeight: 600 }}>Generate structural field estimate:</p>
                      <div className="vertical-form">
                        <div className="input-row-group">
                          <label>Field Survey Verification Date</label>
                          <div className="hybrid-date-wrapper" style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" className="input-field" placeholder="YYYY-MM-DD" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                            <button type="button" className="cal-btn" onClick={handleCalendarClick} style={{ padding: '0 12px' }}><Calendar size={18} /></button>
                            <input type="date" ref={dateInputRef} className="hidden-date" onChange={(e) => setVisitDate(e.target.value)} style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }} />
                          </div>
                        </div>
                        <div className="input-row-group">
                          <label>Calculated Estimate Value (LKR)</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            placeholder="0.00" 
                            value={estimateAmount} 
                            onChange={handleEstimateAmountChange}
                            onKeyDown={handleEstimateAmountKeyDown}
                          />
                        </div>
                        <button className="send-btn" onClick={handleSubmitEstimate} style={{ marginTop: '10px' }}>
                          <Send size={16} /> Submit Estimate
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* Submitted Estimates Directory */}
                {submittedEstimates.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '30px' }}>
                    <div className="field-card" style={{ padding: '24px' }}>
                      <h3 className="recent-jobs-title" style={{ marginBottom: '20px' }}>Submitted Structural Estimates</h3>
                      <div className="table-scroll-wrapper">
                        <table className="project-table">
                          <thead>
                            <tr>
                              <th>No</th>
                              <th>Job No</th>
                              <th>Job Name</th>
                              <th>To Name</th>
                              <th>Allocation</th>
                              <th>Estimate (LKR)</th>
                              <th>Survey Date</th>
                              <th>Approval Flow</th>
                            </tr>
                          </thead>
                          <tbody>
                            {submittedEstimates.map((estimate) => (
                              <tr key={estimate.no}>
                                <td>{estimate.no}</td>
                                <td className="font-mono">{estimate.jobNo}</td>
                                <td className="font-bold">{estimate.jobName}</td>
                                <td>{estimate.toName}</td>
                                <td>{estimate.allocation}</td>
                                <td className="font-bold">{estimate.estimatedAmount}</td>
                                <td>
                                  <button 
                                    onClick={() => handleCheckEstimate(estimate.no)}
                                    className={`status-badge status-${estimate.isChecked ? 'approved' : 'pending'}`}
                                    style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    {estimate.isChecked ? '✓ Checked' : '☐ Mark Check'}
                                  </button>
                                </td>
                                <td>
                                  <span className={`status-badge status-${estimate.sendApproval ? estimate.sendApproval.toLowerCase() : 'pending'}`}>
                                    {estimate.sendApproval}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.section>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <motion.section key="profile" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="profile-view">
                <div className="field-card" style={{ maxWidth: '600px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                    <div className="profile-photo" style={{ width: '80px', height: '80px', position: 'relative' }}>
                      {profilePic ? <img src={profilePic} alt="Profile" /> : <User size={40} />}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                      <button 
                        onClick={() => fileInputRef.current.click()} 
                        className="approve-btn"
                        style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '28px', height: '28px', borderRadius: '50%', padding: 0 }}
                      >
                        <Camera size={14}/>
                      </button>
                    </div>
                    <div>
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Personal Details</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Update your user credentials</p>
                    </div>
                  </div>
                  
                  <div className="vertical-form">
                    <div className="input-row-group">
                      <label>Full Name</label>
                      <input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} className="input-field" />
                    </div>
                    <div className="input-row-group">
                      <label>Registration Reference</label>
                      <input type="text" value={editRegNo} onChange={(e) => setEditRegNo(e.target.value)} className="input-field" />
                    </div>
                    <div className="input-row-group">
                      <label>Email Address</label>
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field" />
                    </div>
                    <div className="input-row-group">
                      <label>Phone Contact</label>
                      <input type="text" value={editPhoneNo} onChange={(e) => setEditPhoneNo(e.target.value)} className="input-field" />
                    </div>
                    
                    <div className="form-action-row" style={{ marginTop: '20px' }}>
                      <button className="save-btn" onClick={handleConfirmProfile}>
                        <Save size={14} /> Confirm
                      </button>
                      <button className="cancel-btn" onClick={handleCancelProfile}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ── Settings Tab ── */}
            {activeTab === 'settings' && (
              <motion.section key="settings" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="profile-view">
                <div className="field-card" style={{ maxWidth: '600px', padding: '24px' }}>
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
              className={`alert-banner alert-${toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : toast.type === 'info' ? 'info' : 'success'}`}
              style={{ pointerEvents: 'all', minWidth: '280px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            >
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'error' && <XCircle size={18} />}
              {toast.type === 'warning' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Clock size={18} />}
              <span style={{ flex: 1, fontSize: '0.85rem' }}>{toast.message}</span>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px', display: 'flex' }}>
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;