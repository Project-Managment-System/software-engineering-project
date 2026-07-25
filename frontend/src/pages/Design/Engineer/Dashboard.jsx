import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardHat, LogOut, Menu, Clock, CheckCircle, Sun, Moon,
  AlertTriangle, Paperclip, Send, BarChart3, Settings, User,
  Save, X, Camera, Wallet, Building2, Bell, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import '../../shared/BranchDashboard.css';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
};

const CustomTooltip = ({ active, payload, formatValue }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const label = data.payload?.name ?? data.name;
    const value = formatValue ? formatValue(data.value) : data.value;
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-base)',
        padding: '12px 16px', borderRadius: '8px', boxShadow: 'var(--shadow-card)',
        fontFamily: "'Inter', sans-serif"
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontWeight: 900, color: data.payload?.color || 'var(--accent-primary)', fontSize: '1.25rem' }}>
          {value}
        </p>
      </div>
    );
  }
  return null;
};

const SummaryItem = ({ label, value }) => (
  <div style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-base)', background: 'var(--bg-subtle)' }}>
    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginBottom: '6px' }}>{label}</div>
    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
  </div>
);

const DIVISION_COLOR_PALETTE = [
  'var(--accent-primary)', 'var(--info)', 'var(--warning)', 'var(--accent-2)',
  'var(--success)', 'var(--gold)', 'var(--accent-3)', 'var(--danger)',
];

const DivisionStatRow = ({ color, name, amount, percentage, icon: Icon = Building2 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-base)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `color-mix(in srgb, ${color} 16%, transparent)`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{amount}</div>
      </div>
    </div>
    <div style={{ fontSize: '1rem', fontWeight: 800, color, flexShrink: 0 }}>{percentage.toFixed(1)}%</div>
  </div>
);

// Donut (with center total) + per-item stat rows + horizontal comparison bar —
// the shared layout for every breakdown chart on this page.
const BreakdownSection = ({ title, subtitle, data, centerLabel, centerValue, formatValue = (v) => v, barTickFormatter }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="recent-jobs-card" style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 className="recent-jobs-title" style={{ marginBottom: '2px' }}>{title}</h3>
        {subtitle && <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '260px', height: '260px', flexShrink: 0, margin: '0 auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                {data.map((entry, i) => (
                  <Cell key={`donut-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip formatValue={formatValue} />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)' }}>{centerLabel}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)', lineHeight: 1.3 }}>{centerValue}</div>
          </div>
        </div>

        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '260px' }}>
          {data.map((d) => (
            <DivisionStatRow
              key={d.name}
              color={d.color}
              name={d.name}
              amount={formatValue(d.value)}
              percentage={total > 0 ? (d.value / total) * 100 : 0}
              icon={d.icon}
            />
          ))}
        </div>
      </div>

      <h4 style={{ margin: '0 0 12px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)' }}>
        Comparison
      </h4>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 50)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
          <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={!barTickFormatter} tickFormatter={barTickFormatter} />
          <YAxis type="category" dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11, fontWeight: 600 }} width={110} />
          <RechartsTooltip content={<CustomTooltip formatValue={formatValue} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map((entry, i) => (
              <Cell key={`hbar-${i}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const THEME_OPTIONS = [
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'ocean', label: 'Ocean', swatch: '#0891b2' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48' },
  { id: 'amber', label: 'Amber', swatch: '#d97706' },
];

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const DesignEngineerDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('accentTheme') || 'violet');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [sendingJobNo, setSendingJobNo] = useState(null);

  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('designEngineerNotifications') || '[]'); } catch { return []; }
  });
  const prevAssignedRef = useRef(null);

  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('fullName') || 'Design Engineer',
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

      // Notify this engineer when the Director newly assigns them a drawing job
      // (skip the first load).
      const myUserId = localStorage.getItem('userId');
      if (prevAssignedRef.current) {
        const newNotifs = [];
        list.forEach(job => {
          const wasMine = prevAssignedRef.current[job.jobNo] === myUserId;
          const isMineNow = job.assignedDesignEngineerId === myUserId;
          if (isMineNow && !wasMine) {
            newNotifs.push({
              id: Date.now() + Math.random(),
              jobNo: job.jobNo,
              title: 'New Drawing Assigned 📐',
              message: `The Design Director assigned you Job ${job.jobNo} (${job.jobName}) — attach the structural drawing.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false
            });
          }
        });
        if (newNotifs.length) setNotifications(prev => [...newNotifs, ...prev]);
      }
      const nextAssignedMap = {};
      list.forEach(job => { nextAssignedMap[job.jobNo] = job.assignedDesignEngineerId; });
      prevAssignedRef.current = nextAssignedMap;
    } catch (err) {
      console.error('Error loading engineer design dashboard data:', err);
    } finally {
      setLoading(false);
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
          name: user.fullName || 'Design Engineer',
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
      console.error('Error fetching engineer profile:', err);
    }
  };

  useEffect(() => { fetchData(); fetchUserProfile(); }, []);

  useEffect(() => {
    localStorage.setItem('designEngineerNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
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

  // The Design Director assigns each drawing request to one specific engineer, so this
  // dashboard scopes jobs to the logged-in engineer. Jobs from before this assignment
  // step existed have no assignedDesignEngineerId — treat those as unassigned/visible to
  // everyone rather than hiding them from every engineer.
  const currentUserId = localStorage.getItem('userId');
  const isMine = (j) => !j.assignedDesignEngineerId || j.assignedDesignEngineerId === currentUserId;
  const pendingJobs = jobs.filter(j => j.drawingWorkflowStatus === 'PendingEngineerDesign' && isMine(j));
  const completedJobs = jobs.filter(j => ['PendingDirectorDesign', 'Completed'].includes(j.drawingWorkflowStatus) && isMine(j));
  const recentJobs = [...pendingJobs, ...completedJobs].slice(0, 5);

  // Overview analytics — every job that has reached the design pipeline (attached, awaiting
  // approval, or approved), used for the charts and summary below.
  const awaitingApprovalJobs = jobs.filter(j => j.drawingWorkflowStatus === 'PendingDirectorDesign');
  const approvedJobs = jobs.filter(j => j.drawingWorkflowStatus === 'Completed');
  const relevantJobs = [...pendingJobs, ...awaitingApprovalJobs, ...approvedJobs];

  const parseAmount = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    const num = parseFloat(String(val).replace(/,/g, ''));
    return Number.isFinite(num) ? num : 0;
  };
  const formatCurrency = (val) => `Rs. ${Math.round(val).toLocaleString()}`;

  const totalAllocation = relevantJobs.reduce((sum, j) => sum + parseAmount(j.allocation), 0);
  const totalEstimatedValue = relevantJobs.reduce((sum, j) => sum + (parseAmount(j.finalEstimateCost) || parseAmount(j.fieldEstimateAmount)), 0);
  const divisionsCovered = new Set(relevantJobs.map(j => j.division).filter(Boolean)).size;

  const workflowStatusData = [
    { name: 'Awaiting Attachment', value: pendingJobs.length, color: 'var(--warning)', icon: Clock },
    { name: 'Awaiting Approval', value: awaitingApprovalJobs.length, color: 'var(--info)', icon: Send },
    { name: 'Approved', value: approvedJobs.length, color: 'var(--success)', icon: CheckCircle },
  ].filter(d => d.value > 0);

  const divisionNames = [...new Set(relevantJobs.map(j => j.division).filter(Boolean))].sort();
  const jobsByDivision = divisionNames.map((div, i) => ({
    name: div,
    value: relevantJobs.filter(j => j.division === div).length,
    color: DIVISION_COLOR_PALETTE[i % DIVISION_COLOR_PALETTE.length],
  })).filter(d => d.value > 0);
  const estimateByDivision = divisionNames.map((div, i) => ({
    name: div,
    value: relevantJobs
      .filter(j => j.division === div)
      .reduce((sum, j) => sum + (parseAmount(j.finalEstimateCost) || parseAmount(j.fieldEstimateAmount)), 0),
    color: DIVISION_COLOR_PALETTE[i % DIVISION_COLOR_PALETTE.length],
  })).filter(d => d.value > 0);

  const handleAttach = async (jobNo) => {
    const file = selectedFiles[jobNo];
    if (!file) {
      alert('Please choose a file to attach first.');
      return;
    }
    setSendingJobNo(jobNo);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${jobNo}`, {
        drawingFileUrl: dataUrl,
        drawingWorkflowStatus: 'PendingDirectorDesign',
        drawingAttachedAt: new Date().toISOString()
      });
      setSelectedFiles(prev => { const next = { ...prev }; delete next[jobNo]; return next; });
      await fetchData();
    } catch (err) {
      console.error('Attach failed:', err);
      alert('Failed to send attachment.');
    } finally {
      setSendingJobNo(null);
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
              {profilePic ? <img src={profilePic} alt="Profile" /> : <HardHat size={32} />}
            </div>
            <div className="profile-info">
              <h3>{profileData.name}</h3>
              <p className="reg-number">Design Branch</p>
              <span className="role-title" style={{
                fontSize: '0.68rem', color: '#ffffff', backgroundColor: 'var(--accent-primary)',
                fontWeight: '800', padding: '3px 10px', borderRadius: '12px', marginTop: '6px',
                textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block'
              }}>
                Design Engineer
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {[
              { id: 'Overview', icon: BarChart3, label: 'Overview' },
              { id: 'Notifications', icon: Bell, label: 'Notifications', count: unreadNotifCount },
              { id: 'Pending', icon: Clock, label: 'Pending Jobs', count: pendingJobs.length },
              { id: 'Completed', icon: CheckCircle, label: 'Completed Jobs', count: completedJobs.length },
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
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your structural drawing workload at a glance</p>
                    </div>
                  </div>
                </div>

                {relevantJobs.length === 0 ? (
                  <div className="placeholder-content" style={{ height: '260px' }}>
                    <AlertTriangle size={32} style={{ opacity: 0.35 }} />
                    <span>{loading ? 'Loading data...' : 'No drawing jobs yet.'}</span>
                  </div>
                ) : (
                  <>
                    <div className="analytics-dashboard-grid" style={{ marginBottom: '24px' }}>
                      <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--warning-soft)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Clock size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{pendingJobs.length}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Awaiting Attachment</div>
                        </div>
                      </div>
                      <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--info-soft)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Send size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{awaitingApprovalJobs.length}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Awaiting Approval</div>
                        </div>
                      </div>
                      <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CheckCircle size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{approvedJobs.length}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Approved Projects</div>
                        </div>
                      </div>
                      <div className="field-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Wallet size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>{formatCurrency(totalEstimatedValue)}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Total Estimated Value</div>
                        </div>
                      </div>
                    </div>

                    <BreakdownSection
                      title="Drawing Status Breakdown"
                      subtitle="Where every drawing job currently stands in the approval pipeline"
                      data={workflowStatusData}
                      centerLabel="Total Jobs"
                      centerValue={relevantJobs.length}
                    />

                    <BreakdownSection
                      title="Jobs by Division"
                      subtitle="How drawing jobs are distributed across divisions"
                      data={jobsByDivision}
                      centerLabel="Total Jobs"
                      centerValue={relevantJobs.length}
                    />

                    {estimateByDivision.length > 0 && (
                      <BreakdownSection
                        title="Estimated Value by Division"
                        subtitle="How the total estimated drawing value breaks down across divisions"
                        data={estimateByDivision}
                        centerLabel="Total Value"
                        centerValue={formatCurrency(totalEstimatedValue)}
                        formatValue={formatCurrency}
                        barTickFormatter={(v) => `${Math.round(v / 1000)}k`}
                      />
                    )}

                    <div className="recent-jobs-card" style={{ marginBottom: '24px' }}>
                      <h3 className="recent-jobs-title">Project Summary</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                        <SummaryItem label="All Completed Projects" value={approvedJobs.length} />
                        <SummaryItem label="Awaiting Your Attachment" value={pendingJobs.length} />
                        <SummaryItem label="Awaiting Director Approval" value={awaitingApprovalJobs.length} />
                        <SummaryItem label="Divisions Covered" value={divisionsCovered} />
                        <SummaryItem label="Total Allocated Budget" value={formatCurrency(totalAllocation)} />
                        <SummaryItem label="Total Estimated Value" value={formatCurrency(totalEstimatedValue)} />
                      </div>
                    </div>
                  </>
                )}

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
                            <th>Serial No</th>
                            <th>Division</th>
                            <th>Job Name</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentJobs.map((j, index) => (
                            <tr key={j._id}>
                              <td>{index + 1}</td>
                              <td>{j.division}</td>
                              <td className="font-bold">{j.jobName}</td>
                              <td>
                                <span className={`status-badge ${j.drawingWorkflowStatus === 'PendingEngineerDesign' ? 'status-pending' : j.drawingWorkflowStatus === 'Completed' ? 'status-approved' : 'status-pending'}`}>
                                  {j.drawingWorkflowStatus === 'PendingEngineerDesign' ? 'Awaiting Attachment' : j.drawingWorkflowStatus === 'Completed' ? 'Drawing Sent to User' : 'Awaiting Director Approval'}
                                </span>
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
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>New drawing jobs assigned to you</p>
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

            {activeTab === 'Pending' && (
              <motion.section key="pending" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Pending Jobs</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jobs the Design Director has assigned to you that need a structural drawing attached</p>
                    </div>
                  </div>
                </div>

                <div className="recent-jobs-card">
                  {pendingJobs.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '200px', border: 'none' }}>
                      <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                      <span>{loading ? 'Loading...' : 'No pending drawing jobs.'}</span>
                    </div>
                  ) : (
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>Serial No</th>
                            <th>Division</th>
                            <th>Job Name</th>
                            <th>Attachment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingJobs.map((j, index) => (
                            <tr key={j._id}>
                              <td>{index + 1}</td>
                              <td>{j.division}</td>
                              <td className="font-bold">{j.jobName}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <label className="cancel-btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <Paperclip size={13} />
                                    {selectedFiles[j.jobNo] ? selectedFiles[j.jobNo].name : 'Choose file'}
                                    <input
                                      type="file"
                                      style={{ display: 'none' }}
                                      onChange={(e) => setSelectedFiles(prev => ({ ...prev, [j.jobNo]: e.target.files[0] }))}
                                    />
                                  </label>
                                  <button
                                    className="save-btn"
                                    disabled={!selectedFiles[j.jobNo] || sendingJobNo === j.jobNo}
                                    onClick={() => handleAttach(j.jobNo)}
                                  >
                                    <Send size={13} /> {sendingJobNo === j.jobNo ? 'Sending...' : 'Send'}
                                  </button>
                                </div>
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
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jobs you've attached a drawing to — now with the Director for approval</p>
                    </div>
                  </div>
                </div>

                <div className="recent-jobs-card">
                  {completedJobs.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '200px', border: 'none' }}>
                      <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                      <span>{loading ? 'Loading...' : 'No completed drawing jobs yet.'}</span>
                    </div>
                  ) : (
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>Serial No</th>
                            <th>Division</th>
                            <th>Job Name</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedJobs.map((j, index) => (
                            <tr
                              key={j._id}
                              onClick={() => navigate(`/design/job/${j.jobNo}`, { state: { job: j } })}
                              style={{ cursor: 'pointer' }}
                              title="Click to view full job details"
                            >
                              <td>{index + 1}</td>
                              <td>{j.division}</td>
                              <td className="font-bold">{j.jobName}</td>
                              <td>
                                <span className={`status-badge ${j.drawingWorkflowStatus === 'Completed' ? 'status-approved' : 'status-pending'}`}>
                                  {j.drawingWorkflowStatus === 'Completed' ? 'Drawing Sent to User' : 'Awaiting Director Approval'}
                                </span>
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

            {activeTab === 'Profile' && (
              <motion.section key="profile" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="profile-view">
                <div className="field-card" style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                      <div className="profile-photo" style={{ width: '100%', height: '100%', margin: 0, position: 'relative' }}>
                        {profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <HardHat size={40} />}
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

export default DesignEngineerDashboard;
