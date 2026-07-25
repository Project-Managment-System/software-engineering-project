import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, LogOut, Menu, Clock, CheckCircle, Sun, Moon,
  AlertTriangle, Eye, BarChart3, Settings, User, Save, X, Camera, UserCheck, Bell, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../shared/BranchDashboard.css';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
};

const THEME_OPTIONS = [
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'ocean', label: 'Ocean', swatch: '#0891b2' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48' },
  { id: 'amber', label: 'Amber', swatch: '#d97706' },
];

// Data URLs can't be opened via target="_blank" (Chrome blocks it with
// "about:blank#blocked"), so convert to a Blob URL before opening.
const openAttachment = (dataUrl) => {
  try {
    const [header, base64] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    console.error('Failed to open attachment:', err);
    alert('Failed to open the attachment.');
  }
};

const DesignDirectorDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('accentTheme') || 'violet');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingJobNo, setApprovingJobNo] = useState(null);
  const [loadingAttachmentJobNo, setLoadingAttachmentJobNo] = useState(null);
  const [seenCompletedIds, setSeenCompletedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('designDirectorSeenCompleted') || '[]'); } catch { return []; }
  });

  const [designEngineers, setDesignEngineers] = useState([]);
  const [assignSelections, setAssignSelections] = useState({});
  const [assigningJobNo, setAssigningJobNo] = useState(null);

  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('designDirectorNotifications') || '[]'); } catch { return []; }
  });
  const prevJobStatusRef = useRef(null);

  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('fullName') || 'Design Director',
    reg: localStorage.getItem('employeeId') || '',
    email: localStorage.getItem('email') || '',
    phone: localStorage.getItem('phoneNo') || ''
  });
  const [profileForm, setProfileForm] = useState(profileData);
  const [profileMessage, setProfileMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/projects/all');
      const list = res.data || [];
      setJobs(list);

      // First time this browser has ever loaded this dashboard, treat every already-completed
      // job as "seen" so the Completed Jobs badge only counts jobs completed from now on,
      // instead of flagging every pre-existing completed job as a new arrival.
      if (localStorage.getItem('designDirectorSeenCompleted') === null) {
        const initialIds = list.filter(j => j.drawingWorkflowStatus === 'Completed').map(j => j._id);
        setSeenCompletedIds(initialIds);
        localStorage.setItem('designDirectorSeenCompleted', JSON.stringify(initialIds));
      }

      // Notify the Director when a new request needs an engineer assignment, or when an
      // engineer has attached a drawing and it's ready for approval (skip the first load).
      if (prevJobStatusRef.current) {
        const newNotifs = [];
        list.forEach(job => {
          const prevStatus = prevJobStatusRef.current[job.jobNo];
          if (job.drawingWorkflowStatus === 'PendingDirectorAssignment' && prevStatus !== 'PendingDirectorAssignment') {
            newNotifs.push({
              id: Date.now() + Math.random(),
              jobNo: job.jobNo,
              title: 'New Drawing Request 📐',
              message: `Job ${job.jobNo} (${job.jobName}) was forwarded by the Divisional Assistant — assign an engineer.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false
            });
          }
          if (job.drawingWorkflowStatus === 'PendingDirectorDesign' && prevStatus !== 'PendingDirectorDesign') {
            newNotifs.push({
              id: Date.now() + Math.random(),
              jobNo: job.jobNo,
              title: 'Drawing Ready for Approval ✅',
              message: `${job.assignedDesignEngineerName || 'The engineer'} attached the drawing for Job ${job.jobNo} — ready for your approval.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false
            });
          }
        });
        if (newNotifs.length) setNotifications(prev => [...newNotifs, ...prev]);
      }
      const nextStatusMap = {};
      list.forEach(job => { nextStatusMap[job.jobNo] = job.drawingWorkflowStatus; });
      prevJobStatusRef.current = nextStatusMap;
    } catch (err) {
      console.error('Error loading director design dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignEngineers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/users');
      const engineers = (res.data || []).filter(u => u.role === 'branch_engineer' && u.branch === 'design');
      setDesignEngineers(engineers);
    } catch (err) {
      console.error('Error loading design engineers:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const res = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
      const user = res.data;
      if (user) {
        const fetchedProfile = {
          name: user.fullName || 'Design Director',
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
    } catch (err) {
      console.error('Error fetching director profile:', err);
    }
  };

  useEffect(() => { fetchData(); fetchUserProfile(); fetchDesignEngineers(); }, []);

  useEffect(() => {
    localStorage.setItem('designDirectorNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    // Write straight to localStorage (not just via the persist effect) — navigate() below
    // unmounts this dashboard in the same tick, which can skip the effect entirely and
    // leave the notification looking unread again next time this page loads.
    const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('designDirectorNotifications', JSON.stringify(updated));
    if (notif.jobNo) navigate(`/design/job/${notif.jobNo}`);
  };

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    const savedTheme = localStorage.getItem('theme');
    localStorage.clear();
    if (savedTheme) localStorage.setItem('theme', savedTheme);
    navigate('/');
  };

  // Forwarded by the DA, awaiting the Director's engineer assignment
  const assignJobs = jobs.filter(j => j.drawingWorkflowStatus === 'PendingDirectorAssignment');
  // Assigned to an Engineer, drawing not yet attached back — shows as "Pending Drawing"
  const inProgressJobs = jobs.filter(j => j.drawingWorkflowStatus === 'PendingEngineerDesign');
  // Director "pending" = drawing attached by the Engineer but not yet approved
  const pendingJobs = jobs.filter(j => j.drawingWorkflowStatus === 'PendingDirectorDesign');
  // Director "completed" = approved
  const completedJobs = jobs.filter(j => j.drawingWorkflowStatus === 'Completed');
  const recentJobs = [...assignJobs, ...inProgressJobs, ...pendingJobs, ...completedJobs].slice(0, 5);

  // Notification badge on "Completed Jobs" only counts jobs not yet viewed —
  // it clears once the Completed Jobs tab has been opened.
  const unseenCompletedCount = completedJobs.filter(j => !seenCompletedIds.includes(j._id)).length;

  useEffect(() => {
    if (activeTab !== 'Completed' || completedJobs.length === 0) return;
    const allIds = completedJobs.map(j => j._id);
    const merged = Array.from(new Set([...seenCompletedIds, ...allIds]));
    if (merged.length !== seenCompletedIds.length) {
      setSeenCompletedIds(merged);
      localStorage.setItem('designDirectorSeenCompleted', JSON.stringify(merged));
    }
    // eslint-disable-next-line
  }, [activeTab, jobs]);

  const handleAssignEngineer = async (jobNo) => {
    const engineerId = assignSelections[jobNo];
    if (!engineerId) {
      alert('Please choose an engineer to assign first.');
      return;
    }
    const engineer = designEngineers.find(e => e._id === engineerId);
    setAssigningJobNo(jobNo);
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${jobNo}`, {
        drawingWorkflowStatus: 'PendingEngineerDesign',
        assignedDesignEngineerId: engineerId,
        assignedDesignEngineerName: engineer?.fullName || '',
        assignedDesignEngineerAt: new Date().toISOString()
      });
      setAssignSelections(prev => { const next = { ...prev }; delete next[jobNo]; return next; });
      await fetchData();
    } catch (err) {
      console.error('Assign failed:', err);
      alert('Failed to assign engineer.');
    } finally {
      setAssigningJobNo(null);
    }
  };

  // Job lists omit drawingFileUrl for performance, so the attachment is fetched on demand here.
  const viewJobAttachment = async (jobNo) => {
    setLoadingAttachmentJobNo(jobNo);
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/projects/job/${jobNo}`);
      if (res.data?.drawingFileUrl) {
        openAttachment(res.data.drawingFileUrl);
      } else {
        alert('No attachment found for this job.');
      }
    } catch (err) {
      console.error('Failed to load attachment:', err);
      alert('Failed to load the attachment.');
    } finally {
      setLoadingAttachmentJobNo(null);
    }
  };

  const handleApprove = async (jobNo) => {
    setApprovingJobNo(jobNo);
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${jobNo}`, {
        drawingWorkflowStatus: 'Completed',
        directorApprovedAt: new Date().toISOString(),
        drawingReceived: true,
        drawingReceivedAt: new Date().toISOString()
      });
      await fetchData();
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Failed to approve drawing.');
    } finally {
      setApprovingJobNo(null);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) { setProfileMessage({ type: 'error', text: 'User session not found.' }); return; }
      const payload = { fullName: profileForm.name, email: profileForm.email, phoneNo: profileForm.phone };
      await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/profile`, payload);
      setProfileData(profileForm);
      localStorage.setItem('fullName', profileForm.name);
      localStorage.setItem('email', profileForm.email);
      localStorage.setItem('phoneNo', profileForm.phone);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileMessage({ type: 'error', text: 'Only image files are allowed (JPG, PNG, GIF, WebP, etc.)' });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setProfilePic(base64Data);
      localStorage.setItem('profilePic', base64Data);
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/profile`, { profilePic: base64Data });
          setProfileMessage({ type: 'success', text: 'Profile photo updated!' });
        }
      } catch (err) {
        setProfileMessage({ type: 'error', text: 'Failed to sync photo.' });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="cems-user-dashboard" className={`${isDark ? 'dark-mode' : 'light-mode'} theme-${accentTheme}`}>
      <button className="sidebar-toggle-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title={isSidebarOpen ? 'Collapse Menu' : 'Expand Menu'}>
        <Menu size={20} />
      </button>

      <div className="user-dashboard-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-box">
            <div className="profile-photo">
              {profilePic ? <img src={profilePic} alt="Profile" /> : <Briefcase size={32} />}
            </div>
            <div className="profile-info">
              <h3>{profileData.name}</h3>
              <p className="reg-number">Design Branch</p>
              <span className="role-title" style={{
                fontSize: '0.68rem', color: '#ffffff', backgroundColor: 'var(--accent-primary)',
                fontWeight: '800', padding: '3px 10px', borderRadius: '12px', marginTop: '6px',
                textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block'
              }}>
                Design Director
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {[
              { id: 'Overview', icon: BarChart3, label: 'Overview' },
              { id: 'Notifications', icon: Bell, label: 'Notifications', count: unreadNotifCount },
              { id: 'Assign', icon: UserCheck, label: 'Assign Engineer', count: assignJobs.length },
              { id: 'Pending', icon: Clock, label: 'Pending Approvals', count: pendingJobs.length },
              { id: 'Completed', icon: CheckCircle, label: 'Completed Jobs', count: unseenCompletedCount },
              { id: 'Profile', icon: User, label: 'Profile' },
              { id: 'Settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                <item.icon size={18} /> {item.label}
                {item.count > 0 && (
                  <span className="nav-unread-badge">{item.count > 99 ? '99+' : item.count}</span>
                )}
              </button>
            ))}

            <button className="nav-item" onClick={toggleDarkMode} style={{ marginTop: '20px', borderTop: '1px solid var(--border-base)', paddingTop: '15px' }}>
              {isDark ? <Sun size={18} style={{ color: '#d97706' }} /> : <Moon size={18} style={{ color: '#8b5cf6' }} />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button className="nav-item logout-nav-item" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </aside>

        <main className={`dashboard-content ${isSidebarOpen ? 'content-shifted-open' : 'content-shifted-closed'}`}>
          <header className="content-header"><div className="header-left" /></header>

          <AnimatePresence mode="wait">
            {activeTab === 'Overview' && (
              <motion.section key="overview" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <BarChart3 size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Overview</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your drawing approval workload at a glance</p>
                    </div>
                  </div>
                </div>

                <div className="analytics-dashboard-grid" style={{ marginBottom: '24px' }}>
                  <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--info-soft)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <UserCheck size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{assignJobs.length}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Awaiting Assignment</div>
                    </div>
                  </div>
                  <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--warning-soft)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{inProgressJobs.length}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Pending Drawing</div>
                    </div>
                  </div>
                  <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--warning-soft)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{pendingJobs.length}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Pending Approval</div>
                    </div>
                  </div>
                  <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{completedJobs.length}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Approved Jobs</div>
                    </div>
                  </div>
                  <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--info-soft)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{assignJobs.length + inProgressJobs.length + pendingJobs.length + completedJobs.length}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Total Handled</div>
                    </div>
                  </div>
                </div>

                <div className="recent-jobs-card">
                  <h3 className="recent-jobs-title">Recent Jobs</h3>
                  {recentJobs.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '160px', border: 'none' }}>
                      <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                      <span>{loading ? 'Loading...' : 'No drawing jobs yet.'}</span>
                    </div>
                  ) : (
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>Division</th>
                            <th>Job Name</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentJobs.map(j => {
                            const statusMeta = j.drawingWorkflowStatus === 'Completed'
                              ? { badge: 'status-approved', label: 'Approved by Director' }
                              : j.drawingWorkflowStatus === 'PendingDirectorAssignment'
                                ? { badge: 'status-pending', label: 'Awaiting Engineer Assignment' }
                                : j.drawingWorkflowStatus === 'PendingEngineerDesign'
                                  ? { badge: 'status-pending', label: 'Pending Drawing' }
                                  : { badge: 'status-pending', label: 'Awaiting Director Approval' };
                            return (
                              <tr
                                key={j._id}
                                onClick={() => navigate(`/design/job/${j.jobNo}`, { state: { job: j } })}
                                style={{ cursor: 'pointer' }}
                                title="Click to view full job details"
                              >
                                <td>{j.division}</td>
                                <td className="font-bold">{j.jobName}</td>
                                <td>
                                  <span className={`status-badge ${statusMeta.badge}`}>{statusMeta.label}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {activeTab === 'Notifications' && (
              <motion.section key="notifications" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                        <Bell size={22} />
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Notifications</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>New requests and drawings that need your attention</p>
                      </div>
                    </div>
                    {notifications.length > 0 && (
                      <button className="cancel-btn" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                <div className="recent-jobs-card">
                  {notifications.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '200px', border: 'none' }}>
                      <Bell size={32} style={{ opacity: 0.35 }} />
                      <span>No notifications yet.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                            padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                            border: `1px solid ${notif.read ? 'var(--border-base)' : 'var(--accent-primary)'}`,
                            background: notif.read ? 'var(--bg-subtle)' : 'color-mix(in srgb, var(--accent-primary) 8%, transparent)'
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{notif.title}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{notif.message}</p>
                          </div>
                          <button
                            className="cancel-btn"
                            style={{ padding: '6px 8px', flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(n => n.id !== notif.id)); }}
                            title="Dismiss"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {activeTab === 'Assign' && (
              <motion.section key="assign" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <UserCheck size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Assign Engineer</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drawing requests forwarded by the Divisional Assistant — choose an engineer to produce each drawing</p>
                    </div>
                  </div>
                </div>

                <div className="recent-jobs-card">
                  {assignJobs.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '200px', border: 'none' }}>
                      <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                      <span>{loading ? 'Loading...' : 'No drawing requests awaiting assignment.'}</span>
                    </div>
                  ) : (
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>Division</th>
                            <th>Job Name</th>
                            <th>Requested On</th>
                            <th>Assign Engineer</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignJobs.map(j => (
                            <tr
                              key={j._id}
                              onClick={() => navigate(`/design/job/${j.jobNo}`, { state: { job: j } })}
                              style={{ cursor: 'pointer' }}
                              title="Click to view full job details"
                            >
                              <td>{j.division}</td>
                              <td className="font-bold">{j.jobName}</td>
                              <td>{j.drawingRequestedAt ? new Date(j.drawingRequestedAt).toLocaleDateString() : 'N/A'}</td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <select
                                  className="job-select-dropdown"
                                  value={assignSelections[j.jobNo] || ''}
                                  onChange={(e) => setAssignSelections(prev => ({ ...prev, [j.jobNo]: e.target.value }))}
                                >
                                  <option value="" disabled>Select engineer</option>
                                  {designEngineers.map(eng => (
                                    <option key={eng._id} value={eng._id}>{eng.fullName}</option>
                                  ))}
                                </select>
                              </td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="save-btn"
                                  disabled={!assignSelections[j.jobNo] || assigningJobNo === j.jobNo}
                                  onClick={() => handleAssignEngineer(j.jobNo)}
                                >
                                  <UserCheck size={13} /> {assigningJobNo === j.jobNo ? 'Assigning...' : 'Assign'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {activeTab === 'Pending' && (
              <motion.section key="pending" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Pending Jobs</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drawings attached by the Engineer, awaiting your approval</p>
                    </div>
                  </div>
                </div>

                <div className="recent-jobs-card">
                  {pendingJobs.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '200px', border: 'none' }}>
                      <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                      <span>{loading ? 'Loading...' : 'No drawings pending approval.'}</span>
                    </div>
                  ) : (
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>Division</th>
                            <th>Job Name</th>
                            <th>Design Engineer</th>
                            <th>Attachment</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingJobs.map(j => (
                            <tr
                              key={j._id}
                              onClick={() => navigate(`/design/job/${j.jobNo}`, { state: { job: j } })}
                              style={{ cursor: 'pointer' }}
                              title="Click to view full job details"
                            >
                              <td>{j.division}</td>
                              <td className="font-bold">{j.jobName}</td>
                              <td>{j.assignedDesignEngineerName || '—'}</td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => viewJobAttachment(j.jobNo)}
                                  className="cancel-btn"
                                  disabled={loadingAttachmentJobNo === j.jobNo}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <Eye size={13} /> {loadingAttachmentJobNo === j.jobNo ? 'Loading...' : 'View'}
                                </button>
                              </td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="save-btn"
                                  disabled={approvingJobNo === j.jobNo}
                                  onClick={() => handleApprove(j.jobNo)}
                                >
                                  <CheckCircle size={13} /> {approvingJobNo === j.jobNo ? 'Approving...' : 'Approve'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {activeTab === 'Completed' && (
              <motion.section key="completed" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Completed Jobs</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drawings you've approved — now available to the user</p>
                    </div>
                  </div>
                </div>

                <div className="recent-jobs-card">
                  {completedJobs.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '200px', border: 'none' }}>
                      <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                      <span>{loading ? 'Loading...' : 'No approved drawings yet.'}</span>
                    </div>
                  ) : (
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>Division</th>
                            <th>Job Name</th>
                            <th>Design Engineer</th>
                            <th>Attachment</th>
                            <th>Approved On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedJobs.map(j => (
                            <tr
                              key={j._id}
                              onClick={() => navigate(`/design/job/${j.jobNo}`, { state: { job: j } })}
                              style={{ cursor: 'pointer' }}
                              title="Click to view full job details"
                            >
                              <td>{j.division}</td>
                              <td className="font-bold">{j.jobName}</td>
                              <td>{j.assignedDesignEngineerName || '—'}</td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => viewJobAttachment(j.jobNo)}
                                  className="cancel-btn"
                                  disabled={loadingAttachmentJobNo === j.jobNo}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <Eye size={13} /> {loadingAttachmentJobNo === j.jobNo ? 'Loading...' : 'View'}
                                </button>
                              </td>
                              <td>{j.directorApprovedAt ? new Date(j.directorApprovedAt).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {activeTab === 'Profile' && (
              <motion.section key="profile" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="profile-view">
                <div className="field-card" style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                      <div className="profile-photo" style={{ width: '100%', height: '100%', margin: 0, position: 'relative' }}>
                        {profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Briefcase size={40} />}
                      </div>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                          position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%',
                          backgroundColor: 'var(--accent-primary)', color: '#fff', border: '3px solid var(--bg-card)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
                        }}
                        title="Change profile photo"
                      >
                        <Camera size={14} />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                    </div>
                    <div>
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Personal Details</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Update your profile information</p>
                    </div>
                  </div>

                  {profileMessage && (
                    <div className={`alert-banner alert-${profileMessage.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '16px' }}>
                      {profileMessage.text}
                    </div>
                  )}

                  <div className="vertical-form">
                    <div className="input-row-group">
                      <label>Full Name</label>
                      <input className="input-field" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                    </div>
                    <div className="input-row-group">
                      <label>Employee ID</label>
                      <input className="input-field" value={profileForm.reg} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    </div>
                    <div className="input-row-group">
                      <label>Email</label>
                      <input className="input-field" value={profileForm.email || ''} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                    </div>
                    <div className="input-row-group">
                      <label>Phone</label>
                      <input
                        className="input-field"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button className="confirm-btn" onClick={handleSaveProfile}><Save size={14} /> Save Profile</button>
                    <button className="cancel-btn" onClick={() => setProfileForm(profileData)}><X size={14} /> Reset</button>
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === 'Settings' && (
              <motion.section key="settings" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="profile-view">
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

                    <div className="input-row-group">
                      <label>Accent Color</label>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {THEME_OPTIONS.map(theme => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              setAccentTheme(theme.id);
                              localStorage.setItem('accentTheme', theme.id);
                            }}
                            title={theme.label}
                            style={{
                              width: '38px', height: '38px', borderRadius: '50%', background: theme.swatch,
                              border: accentTheme === theme.id ? '3px solid var(--text-primary)' : '3px solid transparent',
                              boxShadow: accentTheme === theme.id ? `0 0 0 2px ${theme.swatch}` : 'none',
                              cursor: 'pointer', padding: 0, transition: 'transform 0.15s ease',
                              transform: accentTheme === theme.id ? 'scale(1.1)' : 'scale(1)'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DesignDirectorDashboard;
