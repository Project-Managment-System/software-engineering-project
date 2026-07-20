import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, RefreshCw, Settings, Save, Edit3, Camera, LogOut, Menu,
  Send, Calendar, Sun, Moon, Clock, CheckCircle, XCircle, AlertTriangle, X,
  FileText, MessageSquare, Bell, RotateCcw, Check, Download, Hash, Layers,
  LayoutDashboard, Activity, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import DivisionChat from '../../components/DivisionChat';

/* ─── Custom Tooltip for Charts ─── */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-base)',
        padding: '12px 16px', borderRadius: '8px', boxShadow: 'var(--shadow-card)',
        fontFamily: "'Inter', sans-serif"
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{data.name}</p>
        <p style={{ margin: '4px 0 0', fontWeight: 900, color: data.payload?.color || 'var(--accent-primary)', fontSize: '1.25rem' }}>
          {data.value}
        </p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

/* ─── Formats a raw numeric string with thousand separators, ATM-style, while typing ─── */
const formatCurrencyInput = (value) => {
  if (!value) return '';
  const [intPart, decPart] = String(value).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
};

/* ─── Animation variants ─── */
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } }
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
};

/* ─── Role Formatting Helpers ─── */
/* ─── Selectable accent color themes (Settings) ─── */
const THEME_OPTIONS = [
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'ocean', label: 'Ocean', swatch: '#0891b2' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48' },
  { id: 'amber', label: 'Amber', swatch: '#d97706' },
];

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
  const fileInputRef = useRef(null);

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('accentTheme') || 'violet');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [selectedJobId, setSelectedJobId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [isDateConfirmed, setIsDateConfirmed] = useState(false);
  const [finalEstimateCost, setFinalEstimateCost] = useState('');
  const [finalEstimateDate, setFinalEstimateDate] = useState('');
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_notifications') || '[]');
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('user_notifications', JSON.stringify(notifications));
  }, [notifications]);

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
  const prevReviewStatusRef = useRef(null);

  /* ─── Toast system ─── */
  const [toasts, setToasts] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
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
        const mapped = res.data.map((item, index) => ({
          ...item,
          sNo: index + 1,
          assignDate: item.dateReq ? new Date(item.dateReq).toISOString().split('T')[0] : 'N/A',
          deadline: item.submitDate ? new Date(item.submitDate).toISOString().split('T')[0] : 'N/A'
        }));

        // Detect DA rejections on this user's own jobs (skip the very first load)
        if (prevReviewStatusRef.current) {
          mapped
            .filter(job => job.assignee === profileName)
            .forEach(job => {
              const prevStatus = prevReviewStatusRef.current[job.jobNo];
              if (job.daReviewStatus === 'Rejected' && prevStatus !== 'Rejected') {
                setNotifications(prev => [{
                  id: Date.now() + Math.random(),
                  jobNo: job.jobNo,
                  jobName: job.jobName,
                  title: "Estimate Rejected ⚠️",
                  message: `Your Divisional Assistant rejected the final estimate for Job ${job.jobNo}${job.daReviewNote ? `: "${job.daReviewNote}"` : '.'} Please review and resubmit.`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  read: false
                }, ...prev]);
              }
            });
        }
        const nextStatusMap = {};
        mapped.forEach(job => { nextStatusMap[job.jobNo] = job.daReviewStatus; });
        prevReviewStatusRef.current = nextStatusMap;

        setJobData(mapped);
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

  // Background polling for unread message badge (runs on all tabs)
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const pollUnread = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/messages/unread/${userId}`);
        const counts = res.data || {};
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        setTotalUnread(total);
      } catch (_) { }
      fetchData(); // also re-checks job data for DA review status changes (rejection notifications)
    };
    pollUnread();
    const id = setInterval(pollUnread, 6000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, []);

  const handleCheckEstimate = (estimateNo) => {
    setSubmittedEstimates(submittedEstimates.map(est =>
      est.no === estimateNo ? { ...est, isChecked: !est.isChecked } : est
    ));
    addToast("Estimate status updated!", "info");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      const savedTheme = localStorage.getItem('theme'); // preserve theme across logout
      localStorage.clear();
      if (savedTheme) localStorage.setItem('theme', savedTheme);
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
      setVisitDate(foundJob.fieldVisitedDate ? new Date(foundJob.fieldVisitedDate).toISOString().split('T')[0] : '');
      setIsDateConfirmed(!!foundJob.fieldVisitedDate);
      setFinalEstimateCost(foundJob.finalEstimateCost || '');
      setFinalEstimateDate(foundJob.finalEstimateDate ? new Date(foundJob.finalEstimateDate).toISOString().split('T')[0] : '');
    } else {
      setVisitDate('');
      setIsDateConfirmed(false);
      setFinalEstimateCost('');
      setFinalEstimateDate('');
    }
  };

  const handleSaveJob = async () => {
    // Structural specifications are read-only for users now.
    addToast("Structural specifications cannot be modified by the user", "warning");
  };

  const handleSubmitEstimate = async () => {
    if (!selectedJobId) {
      addToast('Please select a job first.', 'warning');
      return;
    }
    if (!visitDate || !isDateConfirmed) {
      addToast('Please confirm the field visited date first.', 'warning');
      return;
    }
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${selectedJobId}`, {
        fieldVisitedDate: visitDate,
        estimateSubmitted: true,
        estimateSubmittedAt: new Date().toISOString()
      });
      addToast('Estimate details sent to Head Office!', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Failed to submit estimate details.', 'error');
    }
  };

  const handleUndoEstimate = async () => {
    if (!selectedJobId) return;
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${selectedJobId}`, {
        estimateSubmitted: false,
        estimateSubmittedAt: null
      });
      addToast('Estimate submission undone.', 'info');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Failed to undo submission.', 'error');
    }
  };

  const handleSaveFinalEstimate = async () => {
    if (!selectedJobId) return;
    if (!finalEstimateCost || !finalEstimateDate) {
      addToast('Please enter both the final estimate cost and alignment date.', 'warning');
      return;
    }
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${selectedJobId}`, {
        finalEstimateCost: Number(finalEstimateCost),
        finalEstimateDate: finalEstimateDate,
        daReviewStatus: 'Pending',
        daReviewedAt: null,
        daReviewNote: '',
        engineerReviewStatus: 'Pending',
        engineerReviewedAt: null,
        engineerReviewNote: ''
      });
      addToast('Final estimate submitted to your Divisional Assistant for review!', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Failed to save final estimate details.', 'error');
    }
  };

  const handleSimulateReceiveDrawing = async () => {
    if (!selectedJobId || !selectedJob) return;
    try {
      const mockDrawingUrl = "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iagogIDw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+CmVuZG9iagoyIDAgb2JqCiAgPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj4KZW5kb2JqCjMgMCBvYmoKICA8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCiAgPDwvTGVuZ3RoIDU5Pj4Kc3RyZWFtCkJUCiAgL0YxIDE4IFRmCiAgNTQgNzIwIFRkCiAgKFN0cnVjdHVyYWwgRHJhd2luZyBmb3IgQ0VNUyBKb2IpIFRqCkUKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIGYgCjAwMDAwMDAyMDEgMDAwMDAgbiAKdHJhaWxlcgogIDw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjMxMAolJUVPRgo=";
      const payload = {
        drawingReceived: true,
        drawingReceivedAt: new Date(),
        drawingFileUrl: mockDrawingUrl
      };
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${selectedJobId}`, payload);

      const newNotification = {
        id: Date.now(),
        jobNo: selectedJob.jobNo,
        jobName: selectedJob.jobName,
        title: "Drawing Received 📐",
        message: `Head office has sent the structural drawing for Job: ${selectedJob.jobNo}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);
      addToast("Drawing received from Head Office!", "success");
      fetchData();
    } catch (err) {
      console.error(err);
      addToast("Simulation failed", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate: only image files allowed
    if (!file.type.startsWith('image/')) {
      addToast('Only image files are allowed (JPG, PNG, GIF, WebP, etc.)', 'error');
      e.target.value = ''; // reset input
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
  };


  /* ─── Computed stats ─── */
  const totalMyJobs = myJobs.length;
  const totalSubmittedEstimates = submittedEstimates.length;
  const pendingApprovalsCount = myJobs.filter(j => !j.status || j.status === 'Pending').length;
  const approvedJobsCount = myJobs.filter(j => j.status === 'Approved').length;
  const rejectedJobsCount = myJobs.filter(j => j.status === 'Rejected').length;
  const drawingsReceivedCount = myJobs.filter(j => j.drawingReceived).length;

  const statCards = [
    { label: 'My Jobs', value: totalMyJobs, icon: Briefcase, color: 'var(--accent-primary)' },
    { label: 'Estimates Sent', value: totalSubmittedEstimates, icon: Send, color: 'var(--accent-2)' },
    { label: 'Pending Approvals', value: pendingApprovalsCount, icon: Clock, color: 'var(--warning)' },
  ];

  /* ─── Allocation-wise breakdown (for Overview chart) ─── */
  const allocationBreakdown = myJobs.reduce((acc, j) => {
    const a = j.allocation || 'Unassigned';
    if (!acc[a]) acc[a] = { allocation: a, total: 0 };
    acc[a].total++;
    return acc;
  }, {});
  const allocationData = Object.values(allocationBreakdown);

  return (
    <div id="cems-user-dashboard" className={`${isDark ? 'dark-mode' : 'light-mode'} theme-${accentTheme}`}>
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
              {profilePic ? (
                profilePic.startsWith('data:application/pdf') ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer' }} onClick={() => window.open(profilePic, '_blank')} title="View PDF">
                    <FileText size={24} style={{ color: '#ef4444' }} />
                  </div>
                ) : (
                  <img src={profilePic} alt="Profile" />
                )
              ) : (
                <User size={48} />
              )}
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
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'my-jobs', icon: Briefcase, label: 'My Jobs' },
              { id: 'update-progress', icon: RefreshCw, label: 'Update Progress' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'messages', icon: MessageSquare, label: 'Messages' },
              { id: 'profile', icon: Edit3, label: 'Profile' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'messages') setTotalUnread(0);
                  if (item.id === 'profile') handleProfileTabOpen();
                }}
              >
                <item.icon size={18} /> {item.label}
                {item.id === 'messages' && totalUnread > 0 && (
                  <span className="nav-unread-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
                )}
                {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                  <span className="nav-unread-badge">
                    {notifications.filter(n => !n.read).length > 99 ? '99+' : notifications.filter(n => !n.read).length}
                  </span>
                )}
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

          {/* ─── Stat Cards (hidden on messages tab) ─── */}
          {activeTab !== 'messages' && (
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
          )}

          <AnimatePresence mode="wait">
            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={pageVariants} initial="hidden" animate="visible" exit="exit">

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Activity size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                        Welcome back, {profileName.split(' ')[0]}
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Here's a summary of your jobs and estimate activity{userDivision ? ` in ${userDivision}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {totalMyJobs === 0 ? (
                  <div className="placeholder-content" style={{ height: '300px' }}>
                    <BarChart3 size={36} style={{ opacity: 0.35 }} />
                    <span>No jobs assigned to you yet.</span>
                  </div>
                ) : (
                  <>
                    {/* ── Summary Cards ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                      {[
                        { label: 'Total Jobs', value: totalMyJobs, color: '#6366f1', pct: 100 },
                        { label: 'Approved', value: approvedJobsCount, color: '#10b981', pct: totalMyJobs > 0 ? Math.round((approvedJobsCount / totalMyJobs) * 100) : 0 },
                        { label: 'Pending', value: pendingApprovalsCount, color: '#f59e0b', pct: totalMyJobs > 0 ? Math.round((pendingApprovalsCount / totalMyJobs) * 100) : 0 },
                        { label: 'Rejected', value: rejectedJobsCount, color: '#ef4444', pct: totalMyJobs > 0 ? Math.round((rejectedJobsCount / totalMyJobs) * 100) : 0 },
                      ].map(s => (
                        <div key={s.label} className="field-card" style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: s.color, lineHeight: 1 }}>{s.value}</div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>{s.label}</div>
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, opacity: 0.75 }}>{s.pct}%</div>
                          </div>
                          <div style={{ marginTop: '14px', height: '5px', borderRadius: '99px', background: 'var(--border-base)' }}>
                            <div style={{ height: '100%', borderRadius: '99px', background: s.color, width: `${s.pct}%`, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Charts Row ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>

                      {/* Donut: Job status breakdown */}
                      <div className="field-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                          <h3 className="recent-jobs-title" style={{ margin: 0 }}>Job Status Breakdown</h3>
                        </div>
                        <div style={{ position: 'relative', width: '100%', height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Approved', value: approvedJobsCount, color: '#10b981' },
                                  { name: 'Pending', value: pendingApprovalsCount, color: '#f59e0b' },
                                  { name: 'Rejected', value: rejectedJobsCount, color: '#ef4444' },
                                ].filter(d => d.value > 0)}
                                cx="50%" cy="45%"
                                innerRadius={60} outerRadius={90}
                                paddingAngle={4} dataKey="value"
                              >
                                {[
                                  { name: 'Approved', value: approvedJobsCount, color: '#10b981' },
                                  { name: 'Pending', value: pendingApprovalsCount, color: '#f59e0b' },
                                  { name: 'Rejected', value: rejectedJobsCount, color: '#ef4444' },
                                ].filter(d => d.value > 0).map((entry, i) => (
                                  <Cell key={`cell-${i}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Legend verticalAlign="bottom" height={36}
                                formatter={(value) => (
                                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem' }}>{value}</span>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)', lineHeight: 1 }}>{totalMyJobs}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '3px' }}>Total</div>
                          </div>
                        </div>
                      </div>

                      {/* Bar: Jobs by Allocation */}
                      <div className="field-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} />
                          <h3 className="recent-jobs-title" style={{ margin: 0 }}>Jobs by Allocation</h3>
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={allocationData.map((a, i) => ({ name: a.allocation, total: a.total, color: COLORS[i % COLORS.length] }))}
                              margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10, fontWeight: 600 }} angle={-25} textAnchor="end" interval={0} />
                              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                              <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
                                {allocationData.map((_, i) => (
                                  <Cell key={`bar-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* ── Estimate Pipeline ── */}
                    <div className="field-card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Send size={18} style={{ color: 'var(--accent-primary)' }} />
                        <h3 className="recent-jobs-title" style={{ margin: 0 }}>Estimate Pipeline</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Estimates Sent', value: totalSubmittedEstimates, icon: Send },
                          { label: 'Drawings Received', value: drawingsReceivedCount, icon: CheckCircle },
                        ].map(item => (
                          <div key={item.label} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 16px', borderRadius: '10px',
                            background: 'var(--bg-subtle, rgba(0,0,0,0.03))',
                            border: '1px solid var(--border-base)'
                          }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                              <item.icon size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.value}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                      {/* Column 1: Core Job Specs */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="field-card"
                        style={{ padding: '24px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                          <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
                          <h3 className="recent-jobs-title" style={{ margin: 0 }}>Update Structural Specifications</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {[
                            { label: 'Job Number', value: selectedJob.jobNo, icon: Hash },
                            { label: 'Activity', value: selectedJob.jobName, icon: Briefcase },
                            { label: 'Allocation', value: selectedJob.allocation, icon: Layers },
                            { label: 'Work Allocation Date', value: selectedJob.assignDate, icon: Calendar },
                            { label: 'Deadline Limit', value: selectedJob.deadline, icon: Clock },
                          ].map((field, idx, arr) => (
                            <div
                              key={field.label}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '14px 4px',
                                borderBottom: idx < arr.length - 1 ? '1px solid var(--border-base)' : 'none'
                              }}
                            >
                              <div style={{
                                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                                background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--accent-primary)'
                              }}>
                                <field.icon size={17} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-label)', marginBottom: '3px' }}>
                                  {field.label}
                                </div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {field.value || '—'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Column 2: Generate Structural Field Estimate */}
                      <div className="field-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                          <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
                          <h3 className="recent-jobs-title" style={{ margin: 0 }}>Generate Structural Field Estimate</h3>
                        </div>

                        <div className="vertical-form">
                          {/* Field Visited Date with OK confirm */}
                          <div className="input-row-group" style={{ position: 'relative' }}>
                            <label>Field Visited On</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="date"
                                className="input-field"
                                value={visitDate}
                                disabled={isDateConfirmed}
                                onChange={(e) => setVisitDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                style={{ flex: 1 }}
                              />
                              {!isDateConfirmed && (
                                <button
                                  type="button"
                                  className="tik-btn"
                                  style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                                  onClick={() => {
                                    if (!visitDate) {
                                      addToast('Please select a field visited date first.', 'warning');
                                      return;
                                    }
                                    setIsDateConfirmed(true);
                                  }}
                                >
                                  OK
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Content below — blurred until date confirmed */}
                          <div style={{ filter: isDateConfirmed ? 'none' : 'blur(5px)', transition: 'filter 0.4s ease', pointerEvents: isDateConfirmed ? 'auto' : 'none' }}>

                            <div className="btn-group-estimation" style={{ marginBottom: '14px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                  type="button"
                                  className={`tick-checkbox ${selectedJob.estimateSubmitted ? 'checked' : ''}`}
                                  onClick={handleSubmitEstimate}
                                  disabled={selectedJob.estimateSubmitted}
                                  title="Send estimate details to Head Office"
                                >
                                  {selectedJob.estimateSubmitted && <Check size={20} strokeWidth={3} />}
                                </button>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                  {selectedJob.estimateSubmitted ? 'Sent to Head Office' : 'Tick to send to Head Office'}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="undo-btn"
                                onClick={handleUndoEstimate}
                                disabled={!selectedJob.estimateSubmitted || selectedJob.drawingReceived}
                                title={selectedJob.drawingReceived ? 'Cannot undo after the drawing has been received' : 'Undo the estimate submission'}
                              >
                                <RotateCcw size={16} /> Undo
                              </button>
                            </div>

                            {/* Status indicator */}
                            <div style={{ margin: '0 0 14px', padding: '12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-base)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-label)', fontWeight: 700, textTransform: 'uppercase' }}>Status</span>
                              <span style={{ fontWeight: 800, color: selectedJob.drawingReceived ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                {selectedJob.drawingReceived ? (
                                  <><CheckCircle size={16} /> Received Drawing</>
                                ) : (
                                  <><Clock size={16} /> {(() => {
                                    if (!selectedJob.estimateSubmittedAt) return 'Pending (0 days)';
                                    const diff = Math.floor(Math.abs(new Date() - new Date(selectedJob.estimateSubmittedAt)) / (1000 * 60 * 60 * 24));
                                    return `Pending (${diff} day${diff === 1 ? '' : 's'})`;
                                  })()}</>
                                )}
                              </span>
                            </div>

                            {/* Drawing download */}
                            {selectedJob.drawingReceived && selectedJob.drawingFileUrl && (
                              <div style={{ marginBottom: '14px' }}>
                                <a href={selectedJob.drawingFileUrl} download={`Drawing_${selectedJob.jobNo}.pdf`} className="download-pdf-btn">
                                  <Download size={16} /> Download Drawing PDF
                                </a>
                              </div>
                            )}

                            {/* Dev simulation panel — only relevant before drawing received */}
                            {!selectedJob.drawingReceived && (
                              <div className="simulation-panel" style={{ marginBottom: '14px' }}>
                                <div className="simulation-title">Developer Simulation Panel</div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                                  Simulate Head Office sending the drawing for this job.
                                </p>
                                <button className="action-btn-pill primary" onClick={handleSimulateReceiveDrawing}>
                                  <Send size={12} /> Send Drawing from Head Office
                                </button>
                              </div>
                            )}

                            {/* ─── Sub-field: Final Estimate Cost & Drawing Alignment (only once drawing is received) ─── */}
                            {selectedJob.drawingReceived && (() => {
                              const daStatus = selectedJob.daReviewStatus || 'Pending';
                              const isSubmitted = selectedJob.finalEstimateCost != null;
                              const isLocked = isSubmitted && daStatus !== 'Rejected';
                              return (
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px dashed color-mix(in srgb, var(--accent-primary) 30%, transparent)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-primary)' }}>
                                    ↳ Final Estimate Cost &amp; Drawing Alignment
                                  </span>

                                  {isSubmitted && daStatus === 'Rejected' && (
                                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.8rem' }}>
                                      <strong>Rejected by Divisional Assistant.</strong> {selectedJob.daReviewNote ? selectedJob.daReviewNote : 'Please review and resubmit.'}
                                    </div>
                                  )}
                                  {isSubmitted && daStatus === 'Pending' && (
                                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--warning-soft)', border: '1px solid var(--warning)', color: 'var(--warning)', fontSize: '0.8rem' }}>
                                      Submitted — awaiting review from your Divisional Assistant.
                                    </div>
                                  )}
                                  {isSubmitted && daStatus === 'Approved' && (
                                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--success-soft)', border: '1px solid var(--success)', color: 'var(--success)', fontSize: '0.8rem' }}>
                                      Approved by Divisional Assistant — now with the Engineer for final review.
                                      {selectedJob.engineerReviewStatus === 'Rejected' && (
                                        <div style={{ marginTop: '4px', color: 'var(--danger)' }}>
                                          <strong>Engineer rejected this submission.</strong> {selectedJob.engineerReviewNote || ''}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="form-row">
                                    <div className="input-row-group">
                                      <label>Estimate Cost (LKR)</label>
                                      <div className="currency-input-wrapper">
                                        <span className="currency-prefix">Rs.</span>
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          className={`input-field currency-input${isLocked ? ' disabled' : ''}`}
                                          placeholder="0.00"
                                          value={formatCurrencyInput(finalEstimateCost)}
                                          disabled={isLocked}
                                          onChange={(e) => {
                                            const raw = e.target.value.replace(/,/g, '');
                                            if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
                                              setFinalEstimateCost(raw);
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div className="input-row-group">
                                      <label>Estimate Date</label>
                                      <input
                                        type="date"
                                        className={`input-field${isLocked ? ' disabled' : ''}`}
                                        min={selectedJob.drawingReceivedAt ? new Date(selectedJob.drawingReceivedAt).toISOString().split('T')[0] : ''}
                                        max={new Date().toISOString().split('T')[0]}
                                        value={finalEstimateDate}
                                        disabled={isLocked}
                                        onChange={(e) => setFinalEstimateDate(e.target.value)}
                                      />
                                      <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        Only dates between drawing received date and today can be selected.
                                      </small>
                                    </div>
                                  </div>

                                  {!isLocked && (
                                    <button
                                      className="tik-btn"
                                      style={{ alignSelf: 'flex-start' }}
                                      onClick={handleSaveFinalEstimate}
                                    >
                                      <CheckCircle size={16} /> {daStatus === 'Rejected' ? 'Resubmit Final Estimate' : 'Submit Final Estimate'}
                                    </button>
                                  )}
                                </div>
                              );
                            })()}

                          </div>
                        </div>
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

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
              <motion.section key="notifications" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="notifications-view">
                <div className="field-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Bell size={20} style={{ color: 'var(--accent-primary)' }} />
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>My Notifications</h3>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        className="action-btn-pill secondary"
                        onClick={() => {
                          setNotifications(notifications.map(n => ({ ...n, read: true })));
                          addToast("All notifications marked as read", "success");
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '180px', border: 'none' }}>
                      <Bell size={32} style={{ opacity: 0.35, marginBottom: '10px' }} />
                      <span>You have no notifications yet.</span>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`notification-card-item ${notif.read ? '' : 'unread'}`}>
                          <div className="notification-main">
                            <div className="notification-header">
                              <span className="notification-title">{notif.title}</span>
                              <span className="notification-time">{notif.time}</span>
                            </div>
                            <p className="notification-msg">{notif.message}</p>
                          </div>
                          <div className="notification-btn-row">
                            {!notif.read && (
                              <button
                                className="action-btn-pill primary"
                                onClick={() => {
                                  setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                  addToast("Notification marked as read", "info");
                                }}
                              >
                                Mark as Read
                              </button>
                            )}
                            <button
                              className="action-btn-pill secondary"
                              onClick={() => {
                                setNotifications(notifications.filter(n => n.id !== notif.id));
                                addToast("Notification dismissed", "info");
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <motion.section key="profile" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="profile-view">
                <div className="field-card" style={{ maxWidth: '600px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                      <div
                        className="profile-photo"
                        style={{ width: '100%', height: '100%', margin: 0, position: 'relative' }}
                      >
                        {profilePic ? (
                          <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={40} />
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--user-color, #10b981)',
                          color: '#ffffff',
                          border: '3px solid var(--bg-card, #100d28)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          padding: 0,
                          zIndex: 10
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.15)';
                          e.currentTarget.style.backgroundColor = 'var(--user-color-hover, #059669)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.backgroundColor = 'var(--user-color, #10b981)';
                        }}
                        title="Change profile photo"
                      >
                        <Camera size={14} />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
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

            {/* ── Messages Tab ── */}
            {activeTab === 'messages' && (
              <motion.section key="messages" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <DivisionChat
                  myId={localStorage.getItem('userId')}
                  currentDivision={localStorage.getItem('userDivision')}
                  myRole={localStorage.getItem('role')}
                />
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
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: theme.swatch,
                              border: accentTheme === theme.id ? '3px solid var(--text-primary)' : '3px solid transparent',
                              boxShadow: accentTheme === theme.id ? `0 0 0 2px ${theme.swatch}` : 'none',
                              cursor: 'pointer',
                              padding: 0,
                              transition: 'transform 0.15s ease',
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