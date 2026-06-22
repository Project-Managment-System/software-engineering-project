import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, RefreshCw, Settings, Edit3, LogOut, Save,
  Check, X, Menu, UserPlus, Undo, Trash2, Shield, Clock,
  CheckCircle, XCircle, AlertTriangle, Users, BarChart3, Wrench, Filter,
  Globe, Sun, Moon, Lightbulb, Camera
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

const getRoleBadgeClass = (role) => {
  if (!role) return 'status-pending';
  switch (role.toLowerCase()) {
    case 'admin': return 'status-rejected';
    case 'engineer': return 'status-approved';
    case 'division_assistant': return 'status-success';
    case 'user': return 'status-pending';
    case 'clerk': return 'status-success';
    default: return 'status-pending';
  }
};

/* ─────────────────────────────────────── */
const EngineerDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeTab, setActiveTab] = useState('overview');
  const [jobSubTab, setJobSubTab] = useState('approvals');
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [filterDivision, setFilterDivision] = useState('All');
  const [currentDivision, setCurrentDivision] = useState(localStorage.getItem('userDivision') || '');

  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('fullName') || 'User',
    reg: localStorage.getItem('employeeId') || '',
    email: localStorage.getItem('email') || '',
    phone: localStorage.getItem('phoneNo') || ''
  });
  const [profileForm, setProfileForm] = useState(profileData);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [jobTrackingData, setJobTrackingData] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allSystemUsers, setAllSystemUsers] = useState([]);
  const [userFormData, setUserFormData] = useState({
    employeeId: '',
    firstName: '',
    secondName: '',
    email: '',
    password: '',
    division: localStorage.getItem('userDivision') || '',
    role: ''
  });
  const [userDivision, setUserDivision] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});

  /* ─── Change password state ─── */
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      const res = await axios.get(`http://127.0.0.1:5000/api/projects/division/${division}`);
      const data = res.data.map((item, index) => ({
        ...item,
        sNo: index + 1,
        assignee: item.assignee || ''
      }));
      setApprovalData(data);
      
      const approvedJobs = res.data
        .filter(item => item.status === 'Approved')
        .map((item, index) => ({
          ...item,
          sNo: index + 1,
          assignee: item.assignee || ''
        }));
      setJobTrackingData(approvedJobs);
    } catch (err) { console.error("Error fetching data:", err); }
  };

  const fetchAllProjects = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/projects/all');
      setAllProjects(res.data);
    } catch (err) { console.error("Error fetching all projects:", err); }
  };

  const fetchUsers = async () => {
    try {
      const division = localStorage.getItem('userDivision');
      if (division) {
        const res = await axios.get(`http://127.0.0.1:5000/api/users/division/${division}`);
        setAllSystemUsers(res.data);
      } else {
        const res = await axios.get(`http://127.0.0.1:5000/api/users`);
        setAllSystemUsers(res.data);
      }
    } catch (err) { console.error("Error fetching users:", err); }
  };

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
        const user = res.data;
        if (user) {
          const fetchedProfile = {
            name: user.fullName || 'User',
            reg: user.employeeId || '',
            email: user.email || '',
            phone: user.phoneNo || ''
          };
          setProfileData(fetchedProfile);
          setProfileForm(fetchedProfile);
          setProfilePic(user.profilePic || null);

          localStorage.setItem('fullName', user.fullName || '');
          localStorage.setItem('employeeId', user.employeeId || '');
          localStorage.setItem('email', user.email || '');
          localStorage.setItem('phoneNo', user.phoneNo || '');
          localStorage.setItem('profilePic', user.profilePic || '');
        }
      }
    } catch (err) {
      console.error("Error fetching engineer profile:", err);
    }
  };

  useEffect(() => {
    setUserDivision(localStorage.getItem('userDivision') || '');
    fetchData();
    fetchUsers();
    fetchAllProjects();
    fetchUserProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate('/');
    }
  };

  const startEdit = (job) => { setEditingJob(job.jobNo); setEditForm(job); };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${editForm.jobNo}`, editForm);
      setEditingJob(null);
      fetchData();
      fetchAllProjects();
      addToast('Job updated successfully!', 'success');
    } catch (err) {
      addToast('Update failed!', 'error');
    }
  };

  const handleDelete = async (jobNo) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/projects/delete/${jobNo}`);
        fetchData();
        fetchAllProjects();
        addToast('Job deleted successfully!', 'success');
      } catch (err) {
        addToast('Delete failed!', 'error');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/users/${userId}`);
        setAllSystemUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        addToast('User deleted successfully!', 'success');
      } catch (err) {
        console.error("Error deleting user:", err);
        addToast('Failed to delete user.', 'error');
      }
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user._id);
    setEditUserForm({ ...user });
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/users/${editingUser}`, editUserForm);
      setEditingUser(null);
      fetchUsers();
      addToast('User updated successfully!', 'success');
    } catch (err) {
      console.error("Error updating user:", err);
      addToast('Update failed.', 'error');
    }
  };

  const handleApprove = async (jobNo, status) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/projects/status/${jobNo}`, { status });
      fetchData();
      fetchAllProjects();
      addToast(`Job ${status.toLowerCase()} successfully!`, status === 'Approved' ? 'success' : 'warning');
    } catch (err) {
      addToast('Status update failed!', 'error');
    }
  };

  const handleUndoApproval = async (jobNo) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/projects/undo/${jobNo}`);
      fetchData();
      fetchAllProjects();
      addToast('Status reset to Pending', 'info');
    } catch (error) { console.error("Error undoing status:", error); }
  };

  const handleAssigneeChange = async (jobNo, newAssignee) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/projects/assign/${jobNo}`, { assignee: newAssignee });
      await fetchData();
      await fetchAllProjects();
      addToast(`Assigned to ${newAssignee}`, 'success');
    } catch (error) { console.error("Failed to update:", error); }
  };

  const handleSaveProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        addToast("User session not found", "error");
        return;
      }
      const payload = {
        fullName: profileForm.name,
        email: profileForm.email,
        phoneNo: profileForm.phone
      };
      const res = await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/profile`, payload);
      if (res.data) {
        setProfileData(profileForm);
        localStorage.setItem('fullName', profileForm.name);
        localStorage.setItem('employeeId', profileForm.reg);
        localStorage.setItem('email', profileForm.email);
        localStorage.setItem('phoneNo', profileForm.phone);
        addToast('Profile updated!', 'success');
      }
    } catch (err) {
      console.error("Error updating engineer profile:", err);
      addToast(err.response?.data?.error || "Failed to update profile", "error");
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
          console.error("Error saving engineer profile photo to backend:", err);
          addToast("Failed to sync photo to database", "error");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserFormChange = (e) => {
    setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const payload = {
      employeeId: userFormData.employeeId,
      fullName: `${userFormData.firstName} ${userFormData.secondName || ''}`.trim(),
      email: userFormData.email,
      password: userFormData.password,
      division: userFormData.division || localStorage.getItem('userDivision') || '',
      role: userFormData.role
    };
    try {
      await axios.post('http://127.0.0.1:5000/api/users/add', payload);
      addToast('User saved! They can now log in.', 'success');
      setUserFormData({
        employeeId: '',
        firstName: '',
        secondName: '',
        email: '',
        password: '',
        division: localStorage.getItem('userDivision') || '',
        role: ''
      });
      await fetchUsers();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Save failed. Check if all fields are filled.';
      addToast(errMsg, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (isChangingPassword) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast("New password and confirmation don't match.", 'warning');
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      addToast("Please fill in all password fields.", 'warning');
      return;
    }

    setIsChangingPassword(true);
    try {
      const userId = localStorage.getItem('userId');
      await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      addToast("Password updated successfully!", 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'INCORRECT_CURRENT_PASSWORD') {
        addToast("Current password is incorrect.", 'error');
      } else if (code === 'PASSWORD_TOO_SHORT') {
        addToast("New password is too short.", 'error');
      } else {
        addToast("Failed to update password. Please try again.", 'error');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  /* ─── Computed stats ─── */
  const totalDivisionJobs = approvalData.length;
  const pendingApprovals = approvalData.filter(j => !j.status || j.status === 'Pending').length;
  const approvedCount = approvalData.filter(j => j.status === 'Approved').length;
  const rejectedCount = approvalData.filter(j => j.status === 'Rejected').length;

  const statCards = [
    { label: 'Division Jobs', value: totalDivisionJobs, icon: Briefcase,   color: 'var(--accent-primary)' },
    { label: 'Pending',       value: pendingApprovals,  icon: Clock,       color: 'var(--warning)' },
    { label: 'Approved',      value: approvedCount,     icon: CheckCircle, color: 'var(--success)' },
    { label: 'Rejected',      value: rejectedCount,     icon: XCircle,     color: 'var(--danger, #ef4444)' },
  ];

  /* ─── Compute Smart Suggestions & Recommendations ─── */
  const usersWithJobs = allSystemUsers.map(user => {
    const name = user.fullName || `${user.firstName || ''} ${user.secondName || ''}`.trim();
    const jobCount = allProjects.filter(job => job.assignee === name && job.status !== 'Approved' && job.status !== 'Rejected').length;
    return {
      ...user,
      displayName: name || 'Unnamed User',
      jobCount
    };
  });

  const getRecommendations = () => {
    const recs = [];
    const engineers = usersWithJobs.filter(u => u.role === 'engineer');

    if (engineers.length > 1) {
      const sortedByJobs = [...engineers].sort((a, b) => b.jobCount - a.jobCount);
      const busiest = sortedByJobs[0];
      const leastBusy = sortedByJobs[sortedByJobs.length - 1];
      
      if (busiest.jobCount >= 2 && leastBusy.jobCount === 0) {
        recs.push({
          type: 'warning',
          text: `Workload Balancing Suggestion: ${busiest.displayName} currently has ${busiest.jobCount} active tasks, while ${leastBusy.displayName} is free. Suggest routing new tasks to ${leastBusy.displayName} to optimize division performance.`
        });
      }
    }

    const divisionUnassigned = approvalData.filter(job => !job.assignee);
    if (divisionUnassigned.length > 0) {
      recs.push({
        type: 'info',
        text: `Resource Action Items: There are ${divisionUnassigned.length} unassigned jobs in your division (e.g., Job ${divisionUnassigned[0].jobNo}). Assign them to an engineer to resume tracking.`
      });
    }

    if (pendingApprovals > 0) {
      recs.push({
        type: 'danger',
        text: `Task Delay Warning: You have ${pendingApprovals} pending approvals in your division queue. Please check and approve them to unblock engineering operations.`
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: 'success',
        text: 'All operational parameters are balanced! Every project in your division is fully staffed, and the approvals backlog is clear.'
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div id="cems-user-dashboard" className={isDark ? 'dark-mode' : 'light-mode'}>
      <button className="sidebar-toggle-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <Menu size={20} />
      </button>

      <div className="user-dashboard-layout">
        {/* ─── Sidebar ─── */}
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-box">
            <div className="profile-photo">
              {profilePic ? <img src={profilePic} alt="Profile" /> : <User size={48} />}
            </div>
            <h3>{profileData.name}</h3>
            <p className="reg-number">{profileData.reg}</p>
            <p className="role-title" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginTop: '4px', textTransform: 'uppercase' }}>
              {formatRoleName(localStorage.getItem('role') || 'engineer')}
            </p>
          </div>
          <nav className="sidebar-nav">
            {[
              { id: 'overview',        icon: BarChart3, label: 'Overview' },
              { id: 'my-jobs',         icon: Briefcase, label: 'My Jobs' },
              { id: 'all-jobs',        icon: Globe,     label: 'All Jobs' },
              { id: 'add-user',        icon: UserPlus,  label: 'Add User' },
              { id: 'update-progress', icon: RefreshCw, label: 'Update Progress' },
              { id: 'profile',         icon: Edit3,     label: 'Profile' },
              { id: 'settings',        icon: Settings,  label: 'Settings' },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}

            {/* Dark Mode Sidebar Switch Toggle */}
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

          {/* Division Banner */}
          {currentDivision && (
            <motion.div
              className="division-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Shield size={18} /> {currentDivision} Division
            </motion.div>
          )}

          {/* ─── Stat Cards (Overview & My Jobs only) ─── */}
          {(activeTab === 'overview' || activeTab === 'my-jobs') && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '28px' }}
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
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ─── Tab Content ─── */}
          <AnimatePresence mode="wait">

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  
                  {/* Left Column: Team & Resource Directory */}
                  <div className="field-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Users size={20} style={{ color: 'var(--accent-primary)' }} />
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Team Resource Summary</h3>
                    </div>
                    <div className="table-scroll-wrapper" style={{ borderRadius: '12px', border: '1px solid var(--border-base)', overflow: 'hidden' }}>
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>User Name</th>
                            <th>Position</th>
                            <th>Division</th>
                            <th style={{ textAlign: 'center' }}>Active Jobs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersWithJobs.length === 0 ? (
                            <tr>
                              <td colSpan={4}>
                                <div className="placeholder-content" style={{ height: '100px', border: 'none' }}>
                                  <span>No system users registered.</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            usersWithJobs.map((user) => (
                              <tr key={user._id}>
                                <td className="font-bold">{user.displayName}</td>
                                <td>
                                  <span className={`status-badge ${getRoleBadgeClass(user.role)}`}>
                                    {formatRoleName(user.role)}
                                  </span>
                                </td>
                                <td>{user.division || 'Head Office'}</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{user.jobCount}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: AI Suggestions */}
                  <div className="field-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Lightbulb size={20} style={{ color: '#d97706' }} />
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Allocation suggestions</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`alert-banner alert-${rec.type === 'success' ? 'success' : rec.type === 'danger' ? 'error' : rec.type === 'warning' ? 'warning' : 'info'}`}
                          style={{ margin: 0, padding: '16px', borderRadius: '12px', boxShadow: 'none' }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '1.25rem', lineHeight: '1' }}>
                              {rec.type === 'success' && '🌱'}
                              {rec.type === 'warning' && '💡'}
                              {rec.type === 'info' && '⚠️'}
                              {rec.type === 'danger' && '⏱️'}
                            </span>
                            <span style={{ flex: 1, fontSize: '0.86rem', lineHeight: '1.4', fontWeight: 500 }}>
                              {rec.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ── My Jobs Tab ── */}
            {activeTab === 'my-jobs' && (
              <motion.div key="my-jobs" variants={pageVariants} initial="hidden" animate="visible" exit="exit">

                {/* Sub-tabs */}
                <div className="sub-tabs">
                  <button
                    className={jobSubTab === 'approvals' ? 'active-sub-tab' : ''}
                    onClick={() => setJobSubTab('approvals')}
                    style={jobSubTab === 'approvals' ? { background: 'var(--accent-soft)', color: 'var(--accent-primary)', borderBottom: '3px solid var(--accent-primary)', fontWeight: 700 } : {}}
                  >
                    <CheckCircle size={14} style={{ marginRight: '6px' }} /> Approval Requests
                  </button>
                  <button
                    className={jobSubTab === 'tracking' ? 'active-sub-tab' : ''}
                    onClick={() => setJobSubTab('tracking')}
                    style={jobSubTab === 'tracking' ? { background: 'var(--accent-soft)', color: 'var(--accent-primary)', borderBottom: '3px solid var(--accent-primary)', fontWeight: 700 } : {}}
                  >
                    <Users size={14} style={{ marginRight: '6px' }} /> Assignee
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* Approvals sub-tab */}
                  {jobSubTab === 'approvals' && (
                    <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="table-scroll-wrapper" style={{ borderRadius: '12px', border: '1px solid var(--border-base)', overflow: 'hidden' }}>
                        <table className="project-table">
                          <thead>
                            <tr><th>No</th><th>Job No</th><th>Job Name</th><th>Date of Request</th><th>Allocation</th><th>Approval</th></tr>
                          </thead>
                          <tbody>
                            {approvalData.filter(j => filterDivision === 'All' || j.division === filterDivision).length === 0 ? (
                              <tr>
                                <td colSpan={6}>
                                  <div className="placeholder-content" style={{ height: '140px', border: 'none' }}>
                                    <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                                    <span>No approval requests found</span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              approvalData.filter(j => filterDivision === 'All' || j.division === filterDivision).map((job) => (
                                <tr key={job.jobNo}>
                                  <td>{job.sNo}</td>
                                  <td className="font-mono">{job.jobNo}</td>
                                  <td className="font-bold">{job.jobName}</td>
                                  <td>{formatDate(job.dateReq)}</td>
                                  <td>{job.allocation}</td>
                                  <td>
                                    {job.status === 'Pending' ? (
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="approve-btn" onClick={() => handleApprove(job.jobNo, 'Approved')} title="Approve">
                                          <Check size={15} />
                                        </button>
                                        <button className="reject-btn" onClick={() => handleApprove(job.jobNo, 'Rejected')} title="Reject">
                                          <X size={15} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`status-badge status-${job.status ? job.status.toLowerCase() : 'pending'}`}>
                                          {job.status}
                                        </span>
                                        <button className="edit-btn" onClick={() => handleUndoApproval(job.jobNo)} title="Reset" style={{ padding: '4px 8px', minWidth: 'auto' }}>
                                          <Undo size={13} />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {/* Tracking / Assignee sub-tab */}
                  {jobSubTab === 'tracking' && (
                    <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="table-scroll-wrapper" style={{ borderRadius: '12px', border: '1px solid var(--border-base)', overflow: 'hidden' }}>
                        <table className="project-table">
                          <thead>
                            <tr><th>No</th><th>Job No</th><th>Division</th><th>Job Name</th><th>Allocation</th><th>Assignee</th><th>Action</th></tr>
                          </thead>
                          <tbody>
                            {jobTrackingData.length === 0 ? (
                              <tr>
                                <td colSpan={7}>
                                  <div className="placeholder-content" style={{ height: '140px', border: 'none' }}>
                                    <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                                    <span>No jobs to track</span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              jobTrackingData.map((job) => (
                                <tr key={job.jobNo}>
                                  <td>{job.sNo}</td>
                                  <td className="font-mono">{job.jobNo}</td>
                                  <td>{job.division}</td>
                                  <td className="font-bold">{job.jobName}</td>
                                  <td>{job.allocation}</td>
                                  <td>
                                    <select value={job.assignee || ""} onChange={(e) => handleAssigneeChange(job.jobNo, e.target.value)}>
                                      <option value="" disabled>Select Assignee</option>
                                      {allSystemUsers.map((user) => {
                                        const displayName = user.fullName || `${user.firstName || ''} ${user.secondName || ''}`.trim();
                                        return <option key={user._id} value={displayName}>{displayName || "Unnamed User"}</option>;
                                      })}
                                    </select>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button className="edit-btn" onClick={() => startEdit(job)}>
                                        <Edit3 size={14} /> Edit
                                      </button>
                                      <button className="delete-btn" onClick={() => handleDelete(job.jobNo)}>
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Inline Edit Section */}
                      <AnimatePresence>
                        {editingJob && (
                          <motion.div
                            className="edit-section"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <h3>Update Job: {editForm.jobNo}</h3>
                            <div className="profile-form">
                              <label>Job Name</label>
                              <input value={editForm.jobName} onChange={(e) => setEditForm({...editForm, jobName: e.target.value})} placeholder="Job Name" />
                              <label>Allocation</label>
                              <input value={editForm.allocation} onChange={(e) => setEditForm({...editForm, allocation: e.target.value})} placeholder="Allocation" />
                            </div>
                            <div className="action-buttons">
                              <button className="confirm-btn" onClick={handleUpdate}><Save size={14} /> Update Changes</button>
                              <button className="cancel-btn" onClick={() => setEditingJob(null)}><X size={14} /> Cancel</button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── All Jobs Board Tab ── */}
            {activeTab === 'all-jobs' && (
              <motion.div key="all-jobs" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div className="field-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Globe size={20} style={{ color: 'var(--accent-primary)' }} />
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>All System Jobs Board</h3>
                  </div>

                  <div className="table-scroll-wrapper" style={{ borderRadius: '12px', border: '1px solid var(--border-base)', overflow: 'hidden' }}>
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Job No</th>
                          <th>Job Name</th>
                          <th>Division</th>
                          <th>Ministry</th>
                          <th>Department</th>
                          <th>Assignee</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProjects.length === 0 ? (
                          <tr>
                            <td colSpan={7}>
                              <div className="placeholder-content" style={{ height: '140px', border: 'none' }}>
                                <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                                <span>No system projects found.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          allProjects.map((job) => (
                            <tr key={job.jobNo}>
                              <td className="font-mono">{job.jobNo}</td>
                              <td className="font-bold">{job.jobName}</td>
                              <td>{job.division}</td>
                              <td>{job.ministry}</td>
                              <td>{job.department}</td>
                              <td>
                                {job.assignee ? (
                                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{job.assignee}</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                                )}
                              </td>
                              <td>
                                <span className={`status-badge status-${job.status ? job.status.toLowerCase() : 'pending'}`}>
                                  {job.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Add User Tab ── */}
            {activeTab === 'add-user' && (
              <motion.div key="add-user" variants={pageVariants} initial="hidden" animate="visible" exit="exit">

                <div className="profile-section">
                  <h3><UserPlus size={18} /> Add User Into System</h3>
                  <form className="profile-form" onSubmit={handleSaveUser}>
                    <label>Employee ID *</label>
                    <input name="employeeId" value={userFormData.employeeId} onChange={handleUserFormChange} required />
                    <label>First Name *</label>
                    <input name="firstName" value={userFormData.firstName} onChange={handleUserFormChange} required />
                    <label>Second Name</label>
                    <input name="secondName" value={userFormData.secondName} onChange={handleUserFormChange} />
                    <label>Email Address *</label>
                    <input type="email" name="email" value={userFormData.email} onChange={handleUserFormChange} required />
                    <label>Password *</label>
                    <input type="password" name="password" value={userFormData.password} onChange={handleUserFormChange} required />
                    <label>Division *</label>
                    <input name="division" value={userFormData.division} disabled className="input-field" style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    <label>Position *</label>
                    <select name="role" value={userFormData.role} onChange={handleUserFormChange} className="job-select-dropdown" required>
                      <option value="" disabled>Select Position</option>
                      <option value="division_assistant">Division Assistant</option>
                      <option value="user">User</option>
                      <option value="clerk">Clerk</option>
                    </select>
                    <div className="action-buttons">
                      <button type="submit" className="confirm-btn"><Save size={14} /> Save User</button>
                      <button type="button" className="cancel-btn" onClick={() => setActiveTab('my-jobs')}><X size={14} /> Cancel</button>
                    </div>
                  </form>
                </div>

                {/* System Users Table */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{ marginTop: '28px' }}
                >
                  <h3 className="recent-jobs-title" style={{ marginBottom: '14px' }}>
                    <Users size={18} /> System Users
                  </h3>
                  <div className="table-scroll-wrapper" style={{ borderRadius: '12px', border: '1px solid var(--border-base)', overflow: 'hidden' }}>
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Employee ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Division</th>
                          <th>Position</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSystemUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7}>
                              <div className="placeholder-content" style={{ height: '120px', border: 'none' }}>
                                <Users size={24} style={{ opacity: 0.35 }} />
                                <span>No users in system yet</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          allSystemUsers.map((user, i) => (
                            <tr key={user._id}>
                              <td>{i + 1}</td>
                              <td>
                                {editingUser === user._id ? (
                                  <input
                                    value={editUserForm.employeeId || ''}
                                    onChange={e => setEditUserForm({...editUserForm, employeeId: e.target.value})}
                                    className="input-field"
                                  />
                                ) : <span className="font-mono">{user.employeeId}</span>}
                              </td>
                              <td>
                                {editingUser === user._id ? (
                                  <input
                                    value={editUserForm.fullName || ''}
                                    onChange={e => setEditUserForm({...editUserForm, fullName: e.target.value})}
                                    className="input-field"
                                  />
                                ) : <span className="font-bold">{user.fullName}</span>}
                              </td>
                              <td>
                                {editingUser === user._id ? (
                                  <input
                                    value={editUserForm.email || ''}
                                    onChange={e => setEditUserForm({...editUserForm, email: e.target.value})}
                                    className="input-field"
                                  />
                                ) : user.email}
                              </td>
                              <td>
                                {editingUser === user._id ? (
                                  <input
                                    value={editUserForm.division || ''}
                                    disabled
                                    className="input-field"
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                  />
                                ) : user.division}
                              </td>
                              <td>
                                {editingUser === user._id ? (
                                  <select
                                    value={editUserForm.role || ''}
                                    onChange={e => setEditUserForm({...editUserForm, role: e.target.value})}
                                    className="job-select-dropdown"
                                  >
                                    <option value="division_assistant">Division Assistant</option>
                                    <option value="user">User</option>
                                    <option value="clerk">Clerk</option>
                                  </select>
                                ) : (
                                  <span className={`status-badge ${getRoleBadgeClass(user.role)}`}>
                                    {formatRoleName(user.role)}
                                  </span>
                                )}
                              </td>
                              <td>
                                {editingUser === user._id ? (
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button className="approve-btn" onClick={handleUpdateUser} title="Save">
                                      <Check size={15} />
                                    </button>
                                    <button className="reject-btn" onClick={() => setEditingUser(null)} title="Cancel">
                                      <X size={15} />
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button className="edit-btn" onClick={() => startEditUser(user)} style={{ padding: '5px 8px' }}>
                                      <Edit3 size={14} />
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div className="profile-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                    <div className="profile-photo" style={{ width: '80px', height: '80px', position: 'relative', margin: '0' }}>
                      {profilePic ? <img src={profilePic} alt="Profile" /> : <User size={40} />}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                      <button 
                        onClick={() => fileInputRef.current.click()} 
                        className="approve-btn"
                        style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '28px', height: '28px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Camera size={14}/>
                      </button>
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}><Edit3 size={18} /> Personal Details</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Update your user credentials</p>
                    </div>
                  </div>
                  <div className="profile-form">
                    <label>Full Name</label>
                    <input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
                    <label>Employee ID</label>
                    <input value={profileForm.reg} onChange={(e) => setProfileForm({...profileForm, reg: e.target.value})} />
                    <label>Email</label>
                    <input value={profileForm.email || ''} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} />
                    <label>Phone</label>
                    <input value={profileForm.phone || ''} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                  </div>
                  <div className="action-buttons">
                    <button className="confirm-btn" onClick={handleSaveProfile}><Save size={14} /> Confirm</button>
                    <button className="cancel-btn" onClick={() => setActiveTab('my-jobs')}><X size={14} /> Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Update Progress Tab ── */}
            {activeTab === 'update-progress' && (
              <motion.div key="update-progress" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="placeholder-content">
                <BarChart3 size={36} style={{ opacity: 0.35 }} />
                <p>Update Progress — coming soon</p>
              </motion.div>
            )}

            {/* ── Settings Tab ── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div className="settings-section">
                  <h3><Settings size={18} /> System Settings</h3>
                  <div className="profile-form">
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

                    <h3 style={{ marginTop: '30px', borderTop: '1px solid var(--border-base)', paddingTop: '20px' }}>Change Password</h3>
                    <form className="profile-form" onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                      <label>CURRENT PASSWORD</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="input-field"
                      />
                      <label>NEW PASSWORD</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="input-field"
                      />
                      <label>CONFIRM NEW PASSWORD</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="input-field"
                      />
                      <button type="submit" className="confirm-btn" disabled={isChangingPassword} style={{ marginTop: '10px' }}>
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
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

export default EngineerDashboard;