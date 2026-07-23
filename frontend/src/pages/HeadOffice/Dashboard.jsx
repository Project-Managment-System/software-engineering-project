import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, LogOut, Menu, BarChart3, Briefcase, Clock, CheckCircle,
  XCircle, Users, Filter, X, AlertTriangle, Settings, Sun, Moon,
  Table2, ShieldCheck, Layers, Palette, HardHat, Landmark, KeyRound, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
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

  /* ─── Auth guard: Head Office uses a fixed login, not a DB user record ─── */
  useEffect(() => {
    if (localStorage.getItem('headOfficeAuth') !== 'true') {
      navigate('/headoffice/login');
    }
  }, [navigate]);

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
    localStorage.removeItem('headOfficeAuth');
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
              { id: 'Design', icon: Palette, label: 'Design' },
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

            {/* ── Design Tab: links out to the Engineer & Director preview dashboards ── */}
            {activeTab === 'Design' && (
              <motion.section
                key="design"
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
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Design Section</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preview dashboards, each with its own separate login</p>
                    </div>
                  </div>
                </div>

                <div className="analytics-dashboard-grid">
                  {/* Engineer preview card */}
                  <div className="field-card" style={{ padding: '24px 26px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--success) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                        <HardHat size={22} />
                      </div>
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Engineer Dashboard</h3>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                      Job/task-focused preview — status breakdown, assignments and division workload.
                    </p>
                    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-base)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-label)', marginBottom: '6px' }}>
                        <KeyRound size={12} /> Login Credentials
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Username: <strong>eng123</strong> &nbsp;·&nbsp; Password: <strong>123</strong>
                      </div>
                    </div>
                    <button className="save-btn" onClick={() => navigate('/design/engineer/login')} style={{ width: '100%', justifyContent: 'center' }}>
                      Open Engineer Login <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Director preview card */}
                  <div className="field-card" style={{ padding: '24px 26px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--gold) 16%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                        <Landmark size={22} />
                      </div>
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Director Dashboard</h3>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                      Executive/financial preview — budget allocation by ministry and approval status.
                    </p>
                    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-base)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-label)', marginBottom: '6px' }}>
                        <KeyRound size={12} /> Login Credentials
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Username: <strong>dir123</strong> &nbsp;·&nbsp; Password: <strong>123</strong>
                      </div>
                    </div>
                    <button className="save-btn" onClick={() => navigate('/design/director/login')} style={{ width: '100%', justifyContent: 'center' }}>
                      Open Director Login <ArrowRight size={14} />
                    </button>
                  </div>
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
    </div>
  );
};

export default HeadOfficeDashboard;
