import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, Settings, Edit3, LogOut, Save,
  Check, X, Menu, Trash2, Shield, Clock,
  CheckCircle, XCircle, AlertTriangle, Users, BarChart3,
  Sun, Moon, Camera, TrendingUp, Activity,
  FileText, Globe, Filter, MessageSquare, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import DivisionChat from '../../components/DivisionChat';

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

/* ─── Role helpers ─── */
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
const DivisionalAssistantDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);

  const [currentDivision] = useState(localStorage.getItem('userDivision') || '');

  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('fullName') || 'Divisional Assistant',
    reg: localStorage.getItem('employeeId') || '',
    email: localStorage.getItem('email') || '',
    phone: localStorage.getItem('phoneNo') || ''
  });
  const [profileForm, setProfileForm] = useState(profileData);

  /* ─── Data state ─── */
  const [divisionUsers, setDivisionUsers] = useState([]);
  const [divisionJobs, setDivisionJobs] = useState([]);

  /* ─── Job filter ─── */
  const [jobFilter, setJobFilter] = useState({ ministry: '', status: '' });

  /* ─── Change password state ─── */
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
  };

  /* ─── Fetch data ─── */
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/users/all');
      const divUsers = res.data.filter(u =>
        u.division && currentDivision &&
        u.division.toLowerCase() === currentDivision.toLowerCase() &&
        u.role && u.role.toLowerCase() === 'user'
      );
      setDivisionUsers(divUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/projects/all');
      const divJobs = res.data.filter(j =>
        j.division && currentDivision &&
        j.division.toLowerCase() === currentDivision.toLowerCase()
      );
      setDivisionJobs(divJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const res = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
        const user = res.data;
        if (user) {
          const fetchedProfile = {
            name: user.fullName || 'Divisional Assistant',
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
      console.error("Error fetching divisional assistant profile:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchJobs();
    fetchUserProfile();
    // eslint-disable-next-line
  }, []);

  // Background polling for unread message badge (all tabs)
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
    };
    pollUnread();
    const id = setInterval(pollUnread, 4000);
    return () => clearInterval(id);
  }, []);

  /* ─── Profile handlers ─── */
  const handleSaveProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) { addToast('User session not found', 'error'); return; }
      const payload = { fullName: profileForm.name, email: profileForm.email, phoneNo: profileForm.phone };
      await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/profile`, payload);
      setProfileData(profileForm);
      localStorage.setItem('fullName', profileForm.name);
      localStorage.setItem('email', profileForm.email);
      localStorage.setItem('phoneNo', profileForm.phone);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update profile', 'error');
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
          await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/profile`, { profilePic: base64Data });
          addToast('Profile photo updated!', 'success');
        }
      } catch (err) {
        addToast('Failed to sync photo', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  /* ─── Password change ─── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (isChangingPassword) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast("New passwords don't match.", 'warning');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      addToast('Password must be at least 4 characters.', 'warning');
      return;
    }
    setIsChangingPassword(true);
    try {
      const userId = localStorage.getItem('userId');
      await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      addToast('Password updated successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to change password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  /* ─── Logout ─── */
  const handleLogout = () => {
    const savedTheme = localStorage.getItem('theme'); // preserve theme across logout
    localStorage.clear();
    if (savedTheme) localStorage.setItem('theme', savedTheme);
    navigate('/division/login');
  };

  /* ─── Computed stats ─── */
  const totalUsers = divisionUsers.length;
  const totalJobs = divisionJobs.length;
  const approvedJobs = divisionJobs.filter(j => j.status === 'Approved').length;
  const pendingJobs = divisionJobs.filter(j => !j.status || j.status === 'Pending').length;
  const rejectedJobs = divisionJobs.filter(j => j.status === 'Rejected').length;

  /* ─── Ministry-wise breakdown ─── */
  const ministryBreakdown = divisionJobs.reduce((acc, j) => {
    const m = j.ministry || 'Unknown';
    if (!acc[m]) acc[m] = { ministry: m, total: 0, approved: 0, pending: 0, rejected: 0 };
    acc[m].total++;
    if (j.status === 'Approved') acc[m].approved++;
    else if (j.status === 'Rejected') acc[m].rejected++;
    else acc[m].pending++;
    return acc;
  }, {});
  const ministryData = Object.values(ministryBreakdown);

  /* ─── Filtered jobs ─── */
  const filteredJobs = divisionJobs.filter(j => {
    if (jobFilter.ministry && j.ministry !== jobFilter.ministry) return false;
    if (jobFilter.status && j.status !== jobFilter.status) return false;
    return true;
  });

  const ministryOptions = [...new Set(divisionJobs.map(j => j.ministry).filter(Boolean))].sort();

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  const statCards = [
    { label: 'My Users', value: totalUsers, icon: Users, color: 'var(--accent-primary)' },
    { label: 'Total Jobs', value: totalJobs, icon: Briefcase, color: '#6366f1' },
    { label: 'Approved', value: approvedJobs, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Pending', value: pendingJobs, icon: Clock, color: 'var(--warning)' },
    { label: 'Rejected', value: rejectedJobs, icon: XCircle, color: 'var(--danger)' },
  ];

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
            <h3>{profileData.name}</h3>
            <p className="reg-number">{profileData.reg}</p>
            <p className="role-title" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginTop: '4px', textTransform: 'uppercase' }}>
              Division Assistant
            </p>
          </div>

          {/* Division Badge */}
          {currentDivision && (
            <div style={{
              margin: '0 12px 12px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: 'var(--accent-primary)',
              textAlign: 'center'
            }}>
              📍 {currentDivision}
            </div>
          )}

          <nav className="sidebar-nav">
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'my-users', icon: Users, label: 'My Users' },
              { id: 'view-jobs', icon: Briefcase, label: 'View Jobs' },
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
                }}
              >
                <item.icon size={18} /> {item.label}
                {item.id === 'messages' && totalUnread > 0 && (
                  <span className="nav-unread-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
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

        {/* ─── Main Content ─── */}
        <main className={`dashboard-content ${isSidebarOpen ? 'content-shifted-open' : 'content-shifted-closed'}`}>

          {/* Division Banner */}
          {currentDivision && (
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dark))',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Globe size={16} />
              {currentDivision} Division — Divisional Assistant Portal
            </div>
          )}

          {/* ─── Stat Cards (hidden on messages tab) ─── */}
          {activeTab !== 'messages' && (
            <motion.div
              className="stat-cards-grid"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}
            >
              {statCards.map((stat) => (
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
                        {currentDivision ? `${currentDivision} — Overview` : 'Division Overview'}
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Job analytics and user summary for your division
                      </p>
                    </div>
                  </div>
                </div>

                {totalJobs === 0 ? (
                  <div className="placeholder-content" style={{ height: '300px' }}>
                    <BarChart3 size={36} style={{ opacity: 0.35 }} />
                    <span>No jobs found for your division yet.</span>
                  </div>
                ) : (
                  <>
                    {/* ── Summary Cards ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                      {[
                        { label: 'Total Jobs', value: totalJobs, color: '#6366f1', pct: 100 },
                        { label: 'Approved', value: approvedJobs, color: '#10b981', pct: totalJobs > 0 ? Math.round((approvedJobs / totalJobs) * 100) : 0 },
                        { label: 'Pending', value: pendingJobs, color: '#f59e0b', pct: totalJobs > 0 ? Math.round((pendingJobs / totalJobs) * 100) : 0 },
                        { label: 'Rejected', value: rejectedJobs, color: '#ef4444', pct: totalJobs > 0 ? Math.round((rejectedJobs / totalJobs) * 100) : 0 },
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

                      {/* Donut: Overall status */}
                      <div className="field-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                          <h3 className="recent-jobs-title" style={{ margin: 0 }}>Status Breakdown</h3>
                        </div>
                        <div style={{ position: 'relative', width: '100%', height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Approved', value: approvedJobs, color: '#10b981' },
                                  { name: 'Pending', value: pendingJobs, color: '#f59e0b' },
                                  { name: 'Rejected', value: rejectedJobs, color: '#ef4444' },
                                ].filter(d => d.value > 0)}
                                cx="50%" cy="45%"
                                innerRadius={60} outerRadius={90}
                                paddingAngle={4} dataKey="value"
                              >
                                {[
                                  { name: 'Approved', value: approvedJobs, color: '#10b981' },
                                  { name: 'Pending', value: pendingJobs, color: '#f59e0b' },
                                  { name: 'Rejected', value: rejectedJobs, color: '#ef4444' },
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
                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)', lineHeight: 1 }}>{totalJobs}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '3px' }}>Total</div>
                          </div>
                        </div>
                      </div>

                      {/* Bar: Ministry-wise counts */}
                      <div className="field-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} />
                          <h3 className="recent-jobs-title" style={{ margin: 0 }}>Jobs by Ministry</h3>
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={ministryData.map((m, i) => ({ name: m.ministry.replace('MINISTRY OF ', '').replace('CHIEF ', 'CHIEF\n'), total: m.total, color: COLORS[i % COLORS.length] }))}
                              margin={{ top: 10, right: 10, left: -20, bottom: 60 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 9, fontWeight: 600 }} angle={-35} textAnchor="end" interval={0} />
                              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                              <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
                                {ministryData.map((_, i) => (
                                  <Cell key={`bar-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* ── Users summary ── */}
                    <div className="field-card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Users size={18} style={{ color: 'var(--accent-primary)' }} />
                        <h3 className="recent-jobs-title" style={{ margin: 0 }}>Division Users ({totalUsers})</h3>
                      </div>
                      {divisionUsers.length === 0 ? (
                        <div className="placeholder-content" style={{ height: '100px', border: 'none' }}>
                          <Users size={24} style={{ opacity: 0.35 }} />
                          <span>No users in this division yet.</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {divisionUsers.map(u => (
                            <div key={u._id} style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '10px 16px', borderRadius: '10px',
                              background: 'var(--bg-subtle, rgba(0,0,0,0.03))',
                              border: '1px solid var(--border-base)'
                            }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                                <User size={16} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{u.fullName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.employeeId}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── My Users Tab ── */}
            {activeTab === 'my-users' && (
              <motion.div key="my-users" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Users size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>My Users</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Users under your division — {currentDivision}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="recent-jobs-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>Division Users ({divisionUsers.length})</h3>
                    <button className="confirm-btn" style={{ fontSize: '0.8rem', padding: '8px 16px' }} onClick={fetchUsers}>
                      <TrendingUp size={14} /> Refresh
                    </button>
                  </div>

                  {divisionUsers.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '200px', border: 'none' }}>
                      <Users size={32} style={{ opacity: 0.35 }} />
                      <span>No users found for {currentDivision || 'your division'}.</span>
                    </div>
                  ) : (
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Employee ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Division</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {divisionUsers.map((u, idx) => (
                            <tr key={u._id}>
                              <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                              <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.82rem' }}>{u.employeeId}</td>
                              <td className="font-bold">{u.fullName}</td>
                              <td>{u.email || '—'}</td>
                              <td>{u.division}</td>
                              <td>
                                <span className={`status-badge ${getRoleBadgeClass(u.role)}`}>
                                  {formatRoleName(u.role)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── View Jobs Tab ── */}
            {activeTab === 'view-jobs' && (
              <motion.div key="view-jobs" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Division Jobs</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        All jobs assigned to {currentDivision || 'your division'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="recent-jobs-card">
                  {/* Filters */}
                  <div className="table-filters-row" style={{ marginBottom: '16px' }}>
                    <div className="input-row-group">
                      <label><Filter size={12} /> Filter by Ministry</label>
                      <select value={jobFilter.ministry} onChange={e => setJobFilter(f => ({ ...f, ministry: e.target.value }))} className="input-field">
                        <option value="">All Ministries</option>
                        {ministryOptions.map(m => (<option key={m} value={m}>{m}</option>))}
                      </select>
                    </div>
                    <div className="input-row-group">
                      <label><Filter size={12} /> Filter by Status</label>
                      <select value={jobFilter.status} onChange={e => setJobFilter(f => ({ ...f, status: e.target.value }))} className="input-field">
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    {(jobFilter.ministry || jobFilter.status) && (
                      <button className="cancel-btn" onClick={() => setJobFilter({ ministry: '', status: '' })}>
                        <X size={14} /> Clear
                      </button>
                    )}
                  </div>

                  {filteredJobs.length === 0 ? (
                    <div className="placeholder-content" style={{ height: '200px', border: 'none' }}>
                      <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                      <span>{divisionJobs.length === 0 ? 'No jobs for this division yet.' : 'No jobs match the selected filters.'}</span>
                    </div>
                  ) : (
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>Job No</th>
                            <th>Activity</th>
                            <th>Ministry</th>
                            <th>Department</th>
                            <th>Division</th>
                            <th>Allocation</th>
                            <th>Request Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredJobs.map(j => (
                            <tr key={j._id} className={j.status === 'Rejected' ? 'row-rejected' : ''}>
                              <td className="font-mono">{j.jobNo}</td>
                              <td className="font-bold">{j.jobName}</td>
                              <td>{j.ministry}</td>
                              <td>{j.department}</td>
                              <td>{j.division}</td>
                              <td className="font-bold">{j.allocation}</td>
                              <td>{j.dateReq ? j.dateReq.split('T')[0] : 'N/A'}</td>
                              <td>
                                <span className={`status-badge status-${j.status ? j.status.toLowerCase() : 'pending'}`}>
                                  {j.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div className="profile-view">
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
                            backgroundColor: 'var(--ops-color, #8b5cf6)',
                            color: '#ffffff',
                            border: '3px solid var(--bg-card, #0a1628)',
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
                            e.currentTarget.style.backgroundColor = 'var(--ops-color-hover, #7c3aed)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = 'var(--ops-color, #8b5cf6)';
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
                    <div className="profile-form">
                      <label>Full Name</label>
                      <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" />
                      <label>Employee ID</label>
                      <input value={profileForm.reg} disabled className="input-field" style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                      <label>Email</label>
                      <input value={profileForm.email || ''} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="input-field" />
                      <label>Phone</label>
                      <input value={profileForm.phone || ''} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="input-field" />
                    </div>
                    <div className="action-buttons" style={{ marginTop: '20px' }}>
                      <button className="confirm-btn" onClick={handleSaveProfile}><Save size={14} /> Save Profile</button>
                      <button className="cancel-btn" onClick={() => setProfileForm(profileData)}><X size={14} /> Reset</button>
                    </div>
                  </div>
                </div>
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

            {/* ── Messages Tab ── */}
            {activeTab === 'messages' && (
              <motion.section key="messages" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <DivisionChat
                  myId={localStorage.getItem('userId')}
                  currentDivision={currentDivision}
                  myRole="division_assistant"
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

export default DivisionalAssistantDashboard;
