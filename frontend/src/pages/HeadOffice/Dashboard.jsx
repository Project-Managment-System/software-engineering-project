import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, LogOut, Menu, BarChart3, Briefcase, Clock, CheckCircle,
  XCircle, Users, Filter, X, AlertTriangle, Settings, Sun, Moon,
  Table2, ShieldCheck, Layers, Palette, UserPlus, Save, Landmark, HardHat,
  Mail, Phone, Edit3, Trash2, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { BRANCHES } from '../../constants/branches';
import './Dashboard.css';

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

/* ─── Selectable accent color themes (Settings) ─── */
const THEME_OPTIONS = [
  { id: 'ocean', label: 'Ocean', swatch: '#006EB1' },
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48' },
  { id: 'amber', label: 'Amber', swatch: '#d97706' },
];

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
        <p style={{ margin: '4px 0 0', fontWeight: 900, color: data.payload?.color || 'var(--accent-primary)', fontSize: '1.25rem' }}>
          {data.value}
        </p>
      </div>
    );
  }
  return null;
};

/* ─────────────────────────────────────── */
const HeadOfficeDashboard = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('accentTheme') || 'ocean');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ ministry: '', department: '', division: '', status: '' });

  /* ─── Branches tab filters ─── */
  const [branchFilter, setBranchFilter] = useState({ branch: '', position: '' });
  const handleBranchFilterChange = (e) => {
    const { name, value } = e.target;
    setBranchFilter(prev => ({ ...prev, [name]: value }));
  };
  const handleClearBranchFilter = () => setBranchFilter({ branch: '', position: '' });

  /* ─── Branches tab: view all users of a branch in a table ─── */
  const [selectedBranchSlug, setSelectedBranchSlug] = useState(null);

  /* ─── Branches tab: edit / delete a branch user ─── */
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ fullName: '', email: '', phoneNo: '' });
  const [editUserMessage, setEditUserMessage] = useState(null);

  const openEditUser = (user) => {
    setEditingUser(user);
    setEditUserForm({ fullName: user.fullName || '', email: user.email || '', phoneNo: user.phoneNo || '' });
    setEditUserMessage(null);
  };
  const closeEditUser = () => {
    setEditingUser(null);
    setEditUserMessage(null);
  };
  const handleEditUserFormChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === 'phoneNo' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setEditUserForm(prev => ({ ...prev, [name]: sanitized }));
  };
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/api/users/${editingUser._id}`, {
        fullName: editUserForm.fullName,
        email: editUserForm.email,
        phoneNo: editUserForm.phoneNo
      });
      await fetchData();
      closeEditUser();
    } catch (err) {
      setEditUserMessage({ type: 'error', text: err.response?.data?.error || 'Update failed.' });
    }
  };
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Remove ${user.fullName} (${user.employeeId}) from the system? This cannot be undone.`)) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/users/${user._id}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
  };

  /* ─── Assign Branch Staff form ─── */
  const [branchFormData, setBranchFormData] = useState({
    employeeId: '', firstName: '', secondName: '', email: '', phoneNo: '', password: '', branch: '', role: ''
  });
  const [branchFormMessage, setBranchFormMessage] = useState(null); // { type: 'success'|'error', text }

  const handleBranchFormChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === 'phoneNo' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setBranchFormData(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleSaveBranchUser = async (e) => {
    e.preventDefault();
    const payload = {
      employeeId: branchFormData.employeeId,
      fullName: `${branchFormData.firstName} ${branchFormData.secondName || ''}`.trim(),
      email: branchFormData.email,
      phoneNo: branchFormData.phoneNo,
      password: branchFormData.password,
      branch: branchFormData.branch,
      role: branchFormData.role
    };
    try {
      await axios.post('http://127.0.0.1:5000/api/users/branch-add', payload);
      setBranchFormMessage({ type: 'success', text: 'Branch staff account created — they can now log in.' });
      setBranchFormData({ employeeId: '', firstName: '', secondName: '', email: '', phoneNo: '', password: '', branch: '', role: '' });
      await fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Save failed. Check if all fields are filled.';
      setBranchFormMessage({ type: 'error', text: errMsg });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, usersRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/projects/all'),
        axios.get('http://127.0.0.1:5000/api/users'),
      ]);
      setJobs(jobsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error loading Head Office dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ ministry: '', department: '', division: '', status: '' });
  };

  const getUniqueValues = (key) => {
    const values = jobs.map((j) => j[key]).filter((v) => v !== undefined && v !== null && v !== '');
    return [...new Set(values)].sort();
  };

  const ministryOptions = getUniqueValues('ministry');
  const departmentOptions = getUniqueValues('department');
  const divisionOptions = getUniqueValues('division');

  const filteredJobs = jobs.filter((j) => {
    if (filters.ministry && j.ministry !== filters.ministry) return false;
    if (filters.department && j.department !== filters.department) return false;
    if (filters.division && j.division !== filters.division) return false;
    if (filters.status && (j.status || 'Pending') !== filters.status) return false;
    return true;
  });

  /* ─── Computed stats — high-level rollup across every division dashboard ─── */
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => !j.status || j.status === 'Pending').length;
  const approvedJobs = jobs.filter(j => j.status === 'Approved').length;
  const rejectedJobs = jobs.filter(j => j.status === 'Rejected').length;
  const totalDivisions = getUniqueValues('division').length;
  const totalUsers = users.length;

  const statCards = [
    { label: 'Total Jobs', value: totalJobs, icon: Briefcase, color: 'var(--accent-primary)' },
    { label: 'Pending', value: pendingJobs, icon: Clock, color: 'var(--warning)' },
    { label: 'Approved', value: approvedJobs, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Rejected', value: rejectedJobs, icon: XCircle, color: 'var(--danger)' },
    { label: 'Divisions', value: totalDivisions, icon: Layers, color: 'var(--info)' },
    { label: 'System Users', value: totalUsers, icon: Users, color: 'var(--gold)' },
  ];

  /* ─── Jobs-per-division breakdown (for bar chart) ─── */
  const jobsPerDivision = divisionOptions.map((div) => ({
    name: div,
    count: jobs.filter(j => j.division === div).length,
  }));

  return (
    <div id="cems-user-dashboard" className={`${isDark ? 'dark-mode' : 'light-mode'} theme-${accentTheme}`}>
      {/* Hamburger */}
      <button
        className="sidebar-toggle-menu-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? 'Collapse Menu' : 'Expand Menu'}
      >
        <Menu size={20} />
      </button>

      <div className="user-dashboard-layout">
        {/* ─── Sidebar ─── */}
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-box">
            <div className="profile-photo">
              <Building2 size={32} />
            </div>
            <div className="profile-info">
              <h3>Head Office</h3>
              <p className="reg-number">ID: ho123</p>
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
                Administrator
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {[
              { id: 'Overview', icon: BarChart3, label: 'Overview' },
              { id: 'Records', icon: Table2, label: 'All Records' },
              { id: 'Branches', icon: Palette, label: 'Branches' },
              { id: 'AssignStaff', icon: UserPlus, label: 'Assign Staff' },
              { id: 'Settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon size={18} /> {item.label}
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
          <header className="content-header">
            <div className="header-left" />
          </header>

          {/* ─── Stat Cards ─── */}
          {activeTab !== 'Branches' && activeTab !== 'BranchUsers' && (
          <motion.div
            className="stat-cards-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
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

          <AnimatePresence mode="wait">
            {/* ── Overview Tab ── */}
            {activeTab === 'Overview' && (
              <motion.section
                key="overview"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="project-table-section"
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Ministry-Wide Overview</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consolidated status breakdown across every division dashboard</p>
                    </div>
                  </div>
                </div>

                {totalJobs === 0 ? (
                  <div className="placeholder-content" style={{ height: '300px' }}>
                    <AlertTriangle size={36} style={{ opacity: 0.35 }} />
                    <span>{loading ? 'Loading data...' : 'No job records found in the system.'}</span>
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
                                { name: 'Approved', value: approvedJobs, color: 'var(--success)' },
                                { name: 'Pending', value: pendingJobs, color: 'var(--warning)' },
                                { name: 'Rejected', value: rejectedJobs, color: 'var(--danger)' },
                              ].filter(d => d.value > 0)}
                              cx="50%" cy="50%"
                              innerRadius={65} outerRadius={95}
                              paddingAngle={4} dataKey="value"
                            >
                              {[
                                { name: 'Approved', value: approvedJobs, color: 'var(--success)' },
                                { name: 'Pending', value: pendingJobs, color: 'var(--warning)' },
                                { name: 'Rejected', value: rejectedJobs, color: 'var(--danger)' },
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
                        <div style={{
                          position: 'absolute', top: '44%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center', pointerEvents: 'none'
                        }}>
                          <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)', lineHeight: 1 }}>
                            {totalJobs}
                          </div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>
                            Total Jobs
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bar Chart — Jobs per Division */}
                    <div className="field-card" style={{ padding: '24px 26px 28px' }}>
                      <h3 className="recent-jobs-title">Jobs by Division</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={jobsPerDivision} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10, fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" height={60} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--accent-primary)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {/* ── All Records Tab: high-level table consolidating every division/dashboard's jobs ── */}
            {activeTab === 'Records' && (
              <motion.section
                key="records"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="project-table-section"
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Table2 size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>All Records</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Single high-level table combining every job across all division dashboards</p>
                    </div>
                  </div>
                </div>

                <motion.div
                  className="recent-jobs-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <h3 className="recent-jobs-title">Consolidated Job Register ({filteredJobs.length} of {totalJobs})</h3>

                  <div className="table-filters-row">
                    <div className="input-row-group">
                      <label><Filter size={12} /> Ministry</label>
                      <select name="ministry" value={filters.ministry} onChange={handleFilterChange} className="input-field">
                        <option value="">All Ministries</option>
                        {ministryOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
                      </select>
                    </div>
                    <div className="input-row-group">
                      <label><Filter size={12} /> Department</label>
                      <select name="department" value={filters.department} onChange={handleFilterChange} className="input-field">
                        <option value="">All Departments</option>
                        {departmentOptions.map((d) => (<option key={d} value={d}>{d}</option>))}
                      </select>
                    </div>
                    <div className="input-row-group">
                      <label><Filter size={12} /> Division</label>
                      <select name="division" value={filters.division} onChange={handleFilterChange} className="input-field">
                        <option value="">All Divisions</option>
                        {divisionOptions.map((dv) => (<option key={dv} value={dv}>{dv}</option>))}
                      </select>
                    </div>
                    <div className="input-row-group">
                      <label><Filter size={12} /> Status</label>
                      <select name="status" value={filters.status} onChange={handleFilterChange} className="input-field">
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    {(filters.ministry || filters.department || filters.division || filters.status) && (
                      <button className="cancel-btn" onClick={handleClearFilters}>
                        <X size={14} /> Clear
                      </button>
                    )}
                  </div>

                  <div className="table-scroll-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Job No</th><th>Activity</th><th>Ministry</th><th>Department</th>
                          <th>Division</th><th>DS Division</th><th>Institute</th>
                          <th>Allocation</th><th>Request Date</th><th>Submit Date</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.length === 0 ? (
                          <tr>
                            <td colSpan={11}>
                              <div className="placeholder-content" style={{ height: '160px', border: 'none' }}>
                                <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                                <span>{loading ? 'Loading records...' : jobs.length === 0 ? 'No records available.' : 'No records match the selected filters.'}</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredJobs.map((j) => (
                            <tr key={j._id} className={j.status === 'Rejected' ? 'row-rejected' : ''}>
                              <td className="font-mono">{j.jobNo}</td>
                              <td className="font-bold">{j.jobName}</td>
                              <td>{j.ministry}</td>
                              <td>{j.department}</td>
                              <td>{j.division}</td>
                              <td>{j.dsDivision || '—'}</td>
                              <td>{j.institute || '—'}</td>
                              <td className="font-bold">{j.allocation}</td>
                              <td>{j.dateReq ? j.dateReq.split('T')[0] : 'N/A'}</td>
                              <td>{j.submitDate ? j.submitDate.split('T')[0] : 'N/A'}</td>
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

            {/* ── Branches Tab: assign & review Engineer/Director staff per branch ── */}
            {activeTab === 'Branches' && (
              <motion.section
                key="branches"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="project-table-section"
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Palette size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Branches</h2>
                    </div>
                  </div>
                </div>

                <div className="table-filters-row">
                  <div className="input-row-group">
                    <label><Filter size={12} /> Branch</label>
                    <select name="branch" value={branchFilter.branch} onChange={handleBranchFilterChange} className="input-field">
                      <option value="">All Branches</option>
                      {BRANCHES.map(({ slug, label }) => (<option key={slug} value={slug}>{label}</option>))}
                    </select>
                  </div>
                  <div className="input-row-group">
                    <label><Filter size={12} /> Position</label>
                    <select name="position" value={branchFilter.position} onChange={handleBranchFilterChange} className="input-field">
                      <option value="">All Positions</option>
                      <option value="branch_director">Director</option>
                      <option value="branch_engineer">Engineer</option>
                    </select>
                  </div>
                  {(branchFilter.branch || branchFilter.position) && (
                    <button className="cancel-btn" onClick={handleClearBranchFilter}><X size={14} /> Clear</button>
                  )}
                </div>

                <div className="analytics-dashboard-grid" style={{ marginBottom: '28px' }}>
                  {BRANCHES
                    .filter(({ slug }) => !branchFilter.branch || branchFilter.branch === slug)
                    .map(({ slug, label }) => {
                    const engineers = users.filter(u => u.branch === slug && u.role === 'branch_engineer');
                    const director = users.find(u => u.branch === slug && u.role === 'branch_director');
                    const showDirector = branchFilter.position !== 'branch_engineer';
                    const showEngineers = branchFilter.position !== 'branch_director';

                    const branchUserCount = (director ? 1 : 0) + engineers.length;

                    return (
                      <div key={slug} className={`field-card branch-card ${selectedBranchSlug === slug ? 'branch-card-selected' : ''}`}>
                        <button
                          type="button"
                          className="branch-card-header branch-card-header-btn"
                          onClick={() => { setSelectedBranchSlug(slug); setActiveTab('BranchUsers'); }}
                          title="View all users in this branch"
                        >
                          <div className="branch-card-icon"><Building2 size={19} /></div>
                          <span className="branch-card-title">{label}</span>
                          {branchUserCount > 0 && <span className="branch-role-count branch-card-count">{branchUserCount}</span>}
                        </button>

                        <div className="branch-card-body">
                          {showDirector && (
                            <div className="branch-role-block">
                              <div className="branch-role-icon is-director"><Landmark size={16} /></div>
                              <div className="branch-role-content">
                                <div className="branch-role-label">Director</div>
                                {director ? (
                                  <div className="branch-person-card">
                                    <div className="branch-person-name">
                                      {director.fullName}
                                      <span className="employee-id-tag">{director.employeeId}</span>
                                    </div>
                                    <div className="branch-person-meta"><Mail size={11} /> {director.email || '—'}</div>
                                    <div className="branch-person-meta"><Phone size={11} /> {director.phoneNo || '—'}</div>
                                  </div>
                                ) : (
                                  <div className="branch-unassigned">No director assigned</div>
                                )}
                              </div>
                            </div>
                          )}

                          {showEngineers && (
                            <div className="branch-role-block">
                              <div className="branch-role-icon is-engineer"><HardHat size={16} /></div>
                              <div className="branch-role-content">
                                <div className="branch-role-label">
                                  Engineers
                                  {engineers.length > 0 && <span className="branch-role-count">{engineers.length}</span>}
                                </div>
                                {engineers.length === 0 ? (
                                  <div className="branch-unassigned">No engineers assigned</div>
                                ) : (
                                  engineers.map(eng => (
                                    <div key={eng._id} className="branch-person-card">
                                      <div className="branch-person-name">
                                        {eng.fullName}
                                        <span className="employee-id-tag">{eng.employeeId}</span>
                                      </div>
                                      <div className="branch-person-meta"><Mail size={11} /> {eng.email || '—'}</div>
                                      <div className="branch-person-meta"><Phone size={11} /> {eng.phoneNo || '—'}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* ── Branch Users Tab: drill-down table from clicking a branch card ── */}
            {activeTab === 'BranchUsers' && (() => {
              const branchLabelText = BRANCHES.find(b => b.slug === selectedBranchSlug)?.label || selectedBranchSlug;
              const branchUsers = users
                .filter(u => u.branch === selectedBranchSlug && (u.role === 'branch_director' || u.role === 'branch_engineer'))
                .sort((a, b) => a.role === 'branch_director' ? -1 : b.role === 'branch_director' ? 1 : 0);

              return (
                <motion.section
                  key="branch-users"
                  variants={pageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="project-table-section"
                >
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                        <Building2 size={22} />
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Users in {branchLabelText}</h2>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="recent-jobs-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.3 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Staff Register ({branchUsers.length})</h3>
                      <button className="cancel-btn" onClick={() => setActiveTab('Branches')}><ArrowLeft size={14} /> Back to Branches</button>
                    </div>

                    {branchUsers.length === 0 ? (
                      <div className="placeholder-content" style={{ height: '160px', border: 'none' }}>
                        <AlertTriangle size={28} style={{ opacity: 0.4 }} />
                        <span>No staff assigned to this branch yet.</span>
                      </div>
                    ) : (
                      <div className="table-scroll-wrapper">
                        <table className="project-table">
                          <thead>
                            <tr>
                              <th>Full Name</th>
                              <th>Position</th>
                              <th>Username (Employee ID)</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {branchUsers.map(u => (
                              <tr key={u._id}>
                                <td className="font-bold">{u.fullName}</td>
                                <td>
                                  <span className={`status-badge ${u.role === 'branch_director' ? 'status-director' : 'status-engineer'}`}>
                                    {u.role === 'branch_director' ? 'Director' : 'Engineer'}
                                  </span>
                                </td>
                                <td className="font-mono">{u.employeeId}</td>
                                <td>{u.email || '—'}</td>
                                <td>{u.phoneNo || '—'}</td>
                                <td>
                                  <button className="table-action-btn edit" title="Edit user" onClick={() => openEditUser(u)}><Edit3 size={14} /></button>
                                  <button className="table-action-btn delete" title="Delete user" onClick={() => handleDeleteUser(u)}><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                </motion.section>
              );
            })()}

            {/* ── Assign Staff Tab ── */}
            {activeTab === 'AssignStaff' && (
              <motion.section
                key="assign-staff"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="project-table-section"
              >
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <UserPlus size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Assign Staff</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Create an Engineer or Director account for a branch</p>
                    </div>
                  </div>
                </div>

                <div className="field-card" style={{ maxWidth: '640px', padding: '24px 26px 28px' }}>
                  <form onSubmit={handleSaveBranchUser}>
                    <div className="input-row-group">
                      <label>Employee ID *</label>
                      <input name="employeeId" className="input-field" value={branchFormData.employeeId} onChange={handleBranchFormChange} required />
                    </div>
                    <div className="input-row-group">
                      <label>First Name *</label>
                      <input name="firstName" className="input-field" value={branchFormData.firstName} onChange={handleBranchFormChange} required />
                    </div>
                    <div className="input-row-group">
                      <label>Second Name</label>
                      <input name="secondName" className="input-field" value={branchFormData.secondName} onChange={handleBranchFormChange} />
                    </div>
                    <div className="input-row-group">
                      <label>Email Address *</label>
                      <input type="email" name="email" className="input-field" value={branchFormData.email} onChange={handleBranchFormChange} required />
                    </div>
                    <div className="input-row-group">
                      <label>Phone Number</label>
                      <input type="tel" inputMode="numeric" maxLength={10} name="phoneNo" className="input-field" value={branchFormData.phoneNo} onChange={handleBranchFormChange} />
                    </div>
                    <div className="input-row-group">
                      <label>Password *</label>
                      <input type="password" name="password" className="input-field" value={branchFormData.password} onChange={handleBranchFormChange} required />
                    </div>
                    <div className="input-row-group">
                      <label>Branch *</label>
                      <select name="branch" value={branchFormData.branch} onChange={handleBranchFormChange} className="job-select-dropdown" required>
                        <option value="" disabled>Select Branch</option>
                        {BRANCHES.map(({ slug, label }) => (
                          <option key={slug} value={slug}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-row-group">
                      <label>Position *</label>
                      <select name="role" value={branchFormData.role} onChange={handleBranchFormChange} className="job-select-dropdown" required>
                        <option value="" disabled>Select Position</option>
                        <option value="branch_engineer">Engineer</option>
                        <option value="branch_director">Director</option>
                      </select>
                    </div>

                    {branchFormMessage && (
                      <div className={`alert-banner alert-${branchFormMessage.type === 'success' ? 'success' : 'error'}`} style={{ margin: '4px 0 16px' }}>
                        {branchFormMessage.text}
                      </div>
                    )}

                    <div className="action-buttons">
                      <button type="submit" className="confirm-btn"><Save size={14} /> Save Branch Staff</button>
                    </div>
                  </form>
                </div>
              </motion.section>
            )}

            {/* ── Settings Tab ── */}
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
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {editingUser && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditUser}
          >
            <motion.div
              className="field-card modal-card"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 className="recent-jobs-title" style={{ margin: 0 }}>Edit User</h3>
                <button className="table-action-btn" onClick={closeEditUser} title="Close"><X size={16} /></button>
              </div>

              <form onSubmit={handleSaveEditUser}>
                <div className="input-row-group">
                  <label>Full Name *</label>
                  <input name="fullName" className="input-field" value={editUserForm.fullName} onChange={handleEditUserFormChange} required />
                </div>
                <div className="input-row-group">
                  <label>Email Address *</label>
                  <input type="email" name="email" className="input-field" value={editUserForm.email} onChange={handleEditUserFormChange} required />
                </div>
                <div className="input-row-group">
                  <label>Phone Number</label>
                  <input type="tel" inputMode="numeric" maxLength={10} name="phoneNo" className="input-field" value={editUserForm.phoneNo} onChange={handleEditUserFormChange} />
                </div>
                <div className="input-row-group">
                  <label>Employee ID</label>
                  <input className="input-field" value={editingUser.employeeId} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                </div>

                {editUserMessage && (
                  <div className={`alert-banner alert-${editUserMessage.type === 'success' ? 'success' : 'error'}`} style={{ margin: '4px 0 16px' }}>
                    {editUserMessage.text}
                  </div>
                )}

                <div className="action-buttons">
                  <button type="submit" className="confirm-btn"><Save size={14} /> Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={closeEditUser}><X size={14} /> Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeadOfficeDashboard;
