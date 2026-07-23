import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Briefcase, User, Settings, X, Edit, Trash2,
  LogOut, Edit3, Camera, Menu, CheckCircle, XCircle, Clock,
  BarChart3, Wrench, Filter, Plus, AlertTriangle, Shield, Sun, Moon,
  FileText, MessageSquare, Lock, Bell, Check, Users, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import DivisionChat from '../../components/DivisionChat';
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

/* ─── Division → DS Divisions Covered mapping ─── */
const DIVISION_DS_DIVISIONS = {
  'Anuradhapura-East': ['Nuwaragam Palatha East', 'Mihinthale', 'Kahatagasdigiliya', 'Rambewa'],
  'Anuradhapura-West': ['Nuwaragam Palatha Central', 'Nochchiyagama', 'Rajanganaya', 'Thalawa'],
  'Hingurakgoda': ['Hingurakgoda', 'Medirigiriya'],
  'Kekirawa': ['Kekirawa', 'Galnewa', 'Palagala'],
  'Medawachchiya': ['Medawachchiya', 'Padaviya', 'Kebithigollewa', 'Horowpothana', 'Mahawilachchiya'],
  'Mihinthale': ['Galenbindunuwewa', 'Nachchaduwa', 'Ipalogama', 'Thirappane'],
  'Polonnaruwa': ['Thamankaduwa', 'Dimbulagala'],
  'Thambuttegama': ['Thambuttegama'],
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

/* ─── Custom Chart Tooltip ─── */
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
        <p style={{ margin: '4px 0 0', fontWeight: 900, color: data.payload.color || 'var(--accent-primary)', fontSize: '1.25rem' }}>
          {data.value}
        </p>
      </div>
    );
  }
  return null;
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
const AdminDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('accentTheme') || 'rose');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jobName: '', ministry: '', department: '', division: '',
    work: 'N', allocation: '', dateReq: '', ref: '', institute: '',
    deptIdNo: '', source: '', dsDivision: ''
  });

  const [filters, setFilters] = useState({ department: '', ministry: '', division: '' });

  /* ─── Toast system ─── */
  const [toasts, setToasts] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  /* ─── Clerk rejection notifications (persisted per-user; flags jobs an engineer just rejected) ─── */
  const [notifications, setNotifications] = useState(() => {
    try {
      const uid = localStorage.getItem('userId') || 'anon';
      return JSON.parse(localStorage.getItem(`clerk_notifications_${uid}`) || '[]');
    } catch (_) {
      return [];
    }
  });
  const seenRejectedIdsRef = useRef(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;
    localStorage.setItem(`clerk_notifications_${uid}`, JSON.stringify(notifications));
  }, [notifications]);

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
      const [jobsRes, usersRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/projects/all'),
        axios.get('http://127.0.0.1:5000/api/users'),
      ]);
      const res = jobsRes;
      setJobs(res.data);
      setUsers(usersRes.data || []);

      // Detect jobs an engineer just rejected and raise a notification for the clerk
      if (localStorage.getItem('role') === 'clerk') {
        const uid = localStorage.getItem('userId') || 'anon';
        const division = localStorage.getItem('userDivision');
        const seenKey = `clerk_seen_rejected_${uid}`;
        const rejected = res.data.filter(j => j.status === 'Rejected' && (!division || j.division === division));

        if (seenRejectedIdsRef.current === null) {
          // First load (this session or ever): establish a baseline so we don't spam old rejections
          const stored = localStorage.getItem(seenKey);
          seenRejectedIdsRef.current = stored ? new Set(JSON.parse(stored)) : new Set(rejected.map(j => j._id));
          if (!stored) {
            localStorage.setItem(seenKey, JSON.stringify([...seenRejectedIdsRef.current]));
          }
        }

        const newlyRejected = rejected.filter(j => !seenRejectedIdsRef.current.has(j._id));
        if (newlyRejected.length > 0) {
          newlyRejected.forEach(j => seenRejectedIdsRef.current.add(j._id));
          localStorage.setItem(seenKey, JSON.stringify([...seenRejectedIdsRef.current]));

          const newNotifs = newlyRejected.map(j => ({
            id: `${j._id}-${Date.now()}`,
            jobNo: j.jobNo,
            title: 'Job Rejected',
            message: `${j.jobName} (${j.jobNo}) was rejected by the engineer.${j.remark ? ' Reason: ' + j.remark : ''}`,
            time: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
            read: false,
          }));
          setNotifications(prev => [...newNotifs, ...prev]);
          newNotifs.forEach(n => addToast(`Job rejected: ${n.jobNo}`, 'error'));
        }
      }
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
      console.error("Error fetching admin profile:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserProfile();
  }, []);

  // Background polling for unread message badge (clerk only, all tabs)
  useEffect(() => {
    if (localStorage.getItem('role') !== 'clerk') return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const pollUnread = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/messages/unread/${userId}`);
        const counts = res.data || {};
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        setTotalUnread(total);
      } catch (_) { }
    };
    pollUnread();
    const id = setInterval(pollUnread, 4000);
    return () => clearInterval(id);
  }, []);

  // Background polling for newly rejected jobs (clerk only) — powers the Notifications tab
  useEffect(() => {
    if (localStorage.getItem('role') !== 'clerk') return;
    const id = setInterval(fetchData, 8000);
    return () => clearInterval(id);
  }, []);

  const [profileName, setProfileName] = useState(localStorage.getItem('fullName') || 'John Doe');
  const [regNo, setRegNo] = useState(localStorage.getItem('employeeId') || 'REG/2021/CS/088');
  const [email, setEmail] = useState(localStorage.getItem('email') || 'john.doe@example.com');
  const [phoneNo, setPhoneNo] = useState(localStorage.getItem('phoneNo') || '071-2345678');
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);
  const [userDivision, setUserDivision] = useState(localStorage.getItem('userDivision') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'admin');

  // Lock the "New Job" form's Division field to the logged-in user's own division, if any
  useEffect(() => {
    if (userDivision && DIVISION_DS_DIVISIONS[userDivision] && !editingId) {
      setFormData((prev) => prev.division === userDivision ? prev : {
        ...prev,
        division: userDivision,
        dsDivision: DIVISION_DS_DIVISIONS[userDivision][0] || ''
      });
    }
  }, [userDivision, editingId]);
  const [editProfileName, setEditProfileName] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNo, setEditPhoneNo] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ministry') {
      const firstDept = MINISTRY_DEPARTMENTS[value]?.[0] || '';
      setFormData({ ...formData, ministry: value, department: firstDept });
    } else if (name === 'division') {
      const firstDsDivision = DIVISION_DS_DIVISIONS[value]?.[0] || '';
      setFormData({ ...formData, division: value, dsDivision: firstDsDivision });
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
    const savedTheme = localStorage.getItem('theme'); // preserve theme across logout
    localStorage.removeItem('isAdmin');
    localStorage.clear();
    if (savedTheme) localStorage.setItem('theme', savedTheme);
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
    const lockedDivision = userDivision && DIVISION_DS_DIVISIONS[userDivision] ? userDivision : '';
    setFormData({
      jobName: '', ministry: '', department: '', division: lockedDivision,
      work: 'N', allocation: '', dateReq: '', ref: '', institute: '',
      deptIdNo: '', source: '', dsDivision: DIVISION_DS_DIVISIONS[lockedDivision]?.[0] || ''
    });
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
        console.error("Error saving admin profile photo to backend:", err);
        addToast("Failed to sync photo to database", "error");
      }
    };
    reader.readAsDataURL(file);
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
  const availableDsDivisions = DIVISION_DS_DIVISIONS[formData.division] || [];
  const jobFormDivisionOptions = userDivision && DIVISION_DS_DIVISIONS[userDivision]
    ? [userDivision]
    : Object.keys(DIVISION_DS_DIVISIONS);

  /* ─── Computed stats ─── */
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => !j.status || j.status === 'Pending').length;
  const approvedJobs = jobs.filter(j => j.status === 'Approved').length;
  const rejectedJobs = jobs.filter(j => j.status === 'Rejected').length;

  /* ─── Computed user stats (across all divisions) ─── */
  const totalUsers = users.length;
  const divisionsWithUsers = new Set(users.map(u => u.division).filter(Boolean)).size;
  const usersByDivision = divisionOptions.map((dv) => ({
    name: dv,
    count: users.filter(u => u.division === dv).length,
  }));

  /* ─── Computed filtered stats (for charts) ─── */
  const totalFilteredJobs = filteredJobs.length;
  const pendingFilteredJobs = filteredJobs.filter(j => !j.status || j.status === 'Pending').length;
  const approvedFilteredJobs = filteredJobs.filter(j => j.status === 'Approved').length;
  const rejectedFilteredJobs = filteredJobs.filter(j => j.status === 'Rejected').length;

  const statCards = [
    { label: 'Total Jobs', value: totalJobs, icon: Briefcase, color: 'var(--accent-primary)' },
    { label: 'Pending', value: pendingJobs, icon: Clock, color: 'var(--warning)' },
    { label: 'Approved', value: approvedJobs, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Rejected', value: rejectedJobs, icon: XCircle, color: 'var(--danger)' },
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'var(--info)' },
    { label: 'Divisions Covered', value: divisionsWithUsers, icon: Layers, color: 'var(--gold)' },
  ];

  return (
    <div id="cems-user-dashboard" className={`${isDark ? 'dark-mode' : 'light-mode'} theme-${accentTheme}`}>
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
                {formatRoleName(userRole || 'admin')}
              </span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {[
              { id: 'Overview', icon: BarChart3, label: 'Overview' },
              { id: 'New Job', icon: Plus, label: 'New Job' },
              { id: 'Profile', icon: Edit3, label: 'Profile' },
              { id: 'Settings', icon: Settings, label: 'Settings' },
              // Clerks belong to a division and can use the messaging + notifications features
              ...(localStorage.getItem('role') === 'clerk' ? [
                { id: 'Messages', icon: MessageSquare, label: 'Messages' },
                { id: 'Notifications', icon: Bell, label: 'Notifications' },
              ] : []),
            ].map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'Profile') handleProfileTabOpen();
                  if (item.id === 'Messages') setTotalUnread(0);
                }}
              >
                <item.icon size={18} /> {item.label}
                {item.id === 'Messages' && totalUnread > 0 && (
                  <span className="nav-unread-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
                )}
                {item.id === 'Notifications' && notifications.filter(n => !n.read).length > 0 && (
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
          {activeTab !== 'Messages' && (
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
          )}

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
                        disabled={jobFormDivisionOptions.length === 1}
                      >
                        <option value="" disabled>Select Division</option>
                        {jobFormDivisionOptions.map((div) => (
                          <option key={div} value={div}>{div}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="input-row-group">
                        <label>Activity <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
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

                    <div className="input-row-group">
                      <label>Work <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                      <div className="radio-group">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="work"
                            value="N"
                            checked={formData.work === 'N'}
                            onChange={handleInputChange}
                          />
                          New (N)
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="work"
                            value="R"
                            checked={formData.work === 'R'}
                            onChange={handleInputChange}
                          />
                          Repair (R)
                        </label>
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
                      <div className="input-row-group">
                        <label>DS Division</label>
                        <select
                          name="dsDivision"
                          value={formData.dsDivision || ''}
                          onChange={handleInputChange}
                          className="job-select-dropdown"
                        >
                          {availableDsDivisions.length === 0 ? (
                            <option value="">Select a division first</option>
                          ) : (
                            availableDsDivisions.map((dsDiv) => (
                              <option key={dsDiv} value={dsDiv}>{dsDiv}</option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    {/* ── New fields ── */}
                    <div className="form-row">
                      <div className="input-row-group">
                        <label>Department ID No</label>
                        <input
                          name="deptIdNo"
                          value={formData.deptIdNo || ''}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="e.g. DPT-001"
                        />
                      </div>
                      <div className="input-row-group">
                        <label>Source</label>
                        <input
                          name="source"
                          value={formData.source || ''}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="e.g. Central Fund"
                        />
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
                          <th>Est. No</th><th>Job No</th><th>Activity</th><th>Ministry</th><th>Department</th><th>Institute</th><th>Dept ID No</th><th>Source</th><th>DS Division</th><th>Request Date</th><th>Allocation</th><th>Remark</th><th>Submit Date</th><th>Actions</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.length === 0 ? (
                          <tr>
                            <td colSpan={15}>
                              <div className="placeholder-content" style={{ height: '160px', border: 'none' }}>
                                <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                                <span>{jobs.length === 0 ? 'No jobs added yet.' : 'No jobs match the selected filters.'}</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredJobs.map((j) => {
                            return (
                              <tr key={j._id} className={j.status === 'Rejected' ? 'row-rejected' : ''}>
                                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: 'var(--gold)', fontSize: '0.78rem' }}>{j.estimationNo || '—'}</td>
                                <td className="font-mono">{j.jobNo}</td>
                                <td className="font-bold">{j.jobName}</td>
                                <td>{j.ministry}</td>
                                <td>{j.department}</td>
                                <td>{j.institute}</td>
                                <td>{j.deptIdNo || '—'}</td>
                                <td>{j.source || '—'}</td>
                                <td>{j.dsDivision || '—'}</td>
                                <td>{j.dateReq ? j.dateReq.split('T')[0] : 'N/A'}</td>
                                <td className="font-bold">{j.allocation}</td>
                                <td>{j.remark}</td>
                                <td>{j.submitDate ? j.submitDate.split('T')[0] : 'N/A'}</td>
                                <td>
                                  {j.status === 'Approved' && userRole === 'clerk' ? (
                                    <button className="inactive-btn" disabled title="Locked — job already approved by Engineer">
                                      <Lock size={14} /> Inactive
                                    </button>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button className="approve-btn" onClick={() => handleEditJob(j)} title="Edit">
                                        <Edit size={15} />
                                      </button>
                                      <button className="reject-btn" onClick={() => handleDeleteJob(j.jobNo)} title="Delete">
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <span className={`status-badge status-${j.status ? j.status.toLowerCase() : 'pending'}`}>
                                    {j.status || 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
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
                          backgroundColor: 'var(--admin-color, #f43f5e)',
                          color: '#ffffff',
                          border: '3px solid var(--bg-card, #111827)',
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
                          e.currentTarget.style.backgroundColor = 'var(--admin-color-hover, #e11d48)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.backgroundColor = 'var(--admin-color, #f43f5e)';
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
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={editPhoneNo}
                        onChange={(e) => setEditPhoneNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="input-field"
                      />
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

            {activeTab === 'Overview' && (
              <motion.section
                key="overview"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="project-table-section"
              >
                {/* ── Overview Header ── */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <BarChart3 size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>System Overview</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Summary of users and jobs across all divisions</p>
                    </div>
                  </div>
                </div>

                {/* ── Filters Card ── */}
                <div className="recent-jobs-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>Analytics Filters</h3>
                    {(filters.department || filters.ministry || filters.division) && (
                      <button className="cancel-btn" onClick={handleClearFilters} style={{ minHeight: '32px', padding: '6px 16px' }}>
                        <X size={12} /> Clear Filters
                      </button>
                    )}
                  </div>
                  <div className="table-filters-row" style={{ marginBottom: 0 }}>
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
                      <label><Filter size={12} /> Filter by Department</label>
                      <select name="department" value={filters.department} onChange={handleFilterChange} className="input-field">
                        <option value="">All Departments</option>
                        {departmentOptions.map((d) => (<option key={d} value={d}>{d}</option>))}
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
                </div>

                {/* ── Charts ── */}
                {totalFilteredJobs === 0 ? (
                  <div className="placeholder-content" style={{ height: '300px' }}>
                    <AlertTriangle size={36} style={{ opacity: 0.35 }} />
                    <span>No data available for the selected filters.</span>
                  </div>
                ) : (
                  <div className="analytics-dashboard-grid">

                    {/* Donut Chart */}
                    <div className="field-card" style={{ padding: '24px 26px 28px' }}>
                      <h3 className="recent-jobs-title">Status Breakdown</h3>
                      <div style={{ position: 'relative', width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Approved', value: approvedFilteredJobs, color: 'var(--success)' },
                                { name: 'Pending', value: pendingFilteredJobs, color: 'var(--warning)' },
                                { name: 'Rejected', value: rejectedFilteredJobs, color: 'var(--danger)' },
                              ].filter(d => d.value > 0)}
                              cx="50%" cy="50%"
                              innerRadius={65} outerRadius={95}
                              paddingAngle={4} dataKey="value"
                            >
                              {[
                                { name: 'Approved', value: approvedFilteredJobs, color: 'var(--success)' },
                                { name: 'Pending', value: pendingFilteredJobs, color: 'var(--warning)' },
                                { name: 'Rejected', value: rejectedFilteredJobs, color: 'var(--danger)' },
                              ].filter(d => d.value > 0).map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Centre label */}
                        <div style={{
                          position: 'absolute', top: '44%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center', pointerEvents: 'none'
                        }}>
                          <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)', lineHeight: 1 }}>
                            {totalFilteredJobs}
                          </div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>
                            Total Jobs
                          </div>
                        </div>
                      </div>

                      {/* Status percentage breakdown */}
                      <div className="status-breakdown-list">
                        {[
                          { name: 'Approved', value: approvedFilteredJobs, color: 'var(--success)' },
                          { name: 'Pending', value: pendingFilteredJobs, color: 'var(--warning)' },
                          { name: 'Rejected', value: rejectedFilteredJobs, color: 'var(--danger)' },
                        ].map((d) => {
                          const pct = totalFilteredJobs > 0 ? Math.round((d.value / totalFilteredJobs) * 100) : 0;
                          return (
                            <div key={d.name} className="status-breakdown-row">
                              <span className="status-breakdown-dot" style={{ background: d.color }} />
                              <span className="status-breakdown-label">{d.name}</span>
                              <span className="status-breakdown-value">{d.value}</span>
                              <div className="status-breakdown-bar-track">
                                <div className="status-breakdown-bar-fill" style={{ width: `${pct}%`, background: d.color }} />
                              </div>
                              <span className="status-breakdown-pct">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="field-card" style={{ padding: '24px 26px 28px' }}>
                      <h3 className="recent-jobs-title">Job Counts Comparison</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Total Jobs', count: totalFilteredJobs, color: 'var(--accent-primary)' },
                              { name: 'Pending', count: pendingFilteredJobs, color: 'var(--warning)' },
                              { name: 'Approved', count: approvedFilteredJobs, color: 'var(--success)' },
                              { name: 'Rejected', count: rejectedFilteredJobs, color: 'var(--danger)' },
                            ]}
                            margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fontWeight: 600 }} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                              {[
                                { name: 'Total Jobs', count: totalFilteredJobs, color: 'var(--accent-primary)' },
                                { name: 'Pending', count: pendingFilteredJobs, color: 'var(--warning)' },
                                { name: 'Approved', count: approvedFilteredJobs, color: 'var(--success)' },
                                { name: 'Rejected', count: rejectedFilteredJobs, color: 'var(--danger)' },
                              ].map((entry, i) => (
                                <Cell key={`bar-${i}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Users by Division */}
                    <div className="field-card" style={{ padding: '24px 26px 28px' }}>
                      <h3 className="recent-jobs-title">Users by Division ({totalUsers} total)</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={usersByDivision} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10, fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" height={60} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--info)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                )}
              </motion.section>
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

            {/* ── Notifications Tab (Clerk only) ── */}
            {activeTab === 'Notifications' && localStorage.getItem('role') === 'clerk' && (
              <motion.section
                key="notifications"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="profile-view"
              >
                <div className="recent-jobs-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>Job Rejection Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        className="cancel-btn"
                        onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                        style={{ minHeight: '32px', padding: '6px 16px' }}
                      >
                        <Check size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '180px' }}>
                      <Bell size={28} style={{ opacity: 0.4 }} />
                      <span>No rejection notifications yet.</span>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`notification-card-item ${notif.read ? '' : 'unread'}`}>
                          <div className="notification-main">
                            <div className="notification-header">
                              <span className="notification-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <XCircle size={14} style={{ color: 'var(--danger)' }} /> {notif.title}
                              </span>
                              <span className="notification-time">{notif.time}</span>
                            </div>
                            <p className="notification-msg">{notif.message}</p>
                          </div>
                          <div className="notification-btn-row">
                            {!notif.read && (
                              <button
                                className="action-btn-pill secondary"
                                onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                              >
                                <Check size={12} /> Read
                              </button>
                            )}
                            <button
                              className="action-btn-pill secondary"
                              onClick={() => setNotifications(notifications.filter(n => n.id !== notif.id))}
                            >
                              <X size={12} /> Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* ── Messages Tab (Clerk only) ── */}
            {activeTab === 'Messages' && localStorage.getItem('role') === 'clerk' && (
              <motion.section key="messages" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <DivisionChat
                  myId={localStorage.getItem('userId')}
                  currentDivision={localStorage.getItem('userDivision')}
                  myRole="clerk"
                />
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