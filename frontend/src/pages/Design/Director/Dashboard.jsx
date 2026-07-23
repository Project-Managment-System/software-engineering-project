import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, LogOut, Menu, BarChart3, Landmark, Clock, CheckCircle,
  XCircle, Filter, X, AlertTriangle, Settings, Sun, Moon,
  Table2, Layers, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import '../../shared/BranchDashboard.css';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
};

const staggerContainer = { visible: { transition: { staggerChildren: 0.08 } } };

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
};

const THEME_OPTIONS = [
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'ocean', label: 'Ocean', swatch: '#0891b2' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48' },
  { id: 'amber', label: 'Amber', swatch: '#d97706' },
];

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

const parseAllocation = (val) => {
  const num = parseFloat(String(val ?? '0').replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};

const DesignDirectorDashboard = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('accentTheme') || 'violet');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ministry: '', status: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/projects/all');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Error loading director design dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
  const handleClearFilters = () => setFilters({ ministry: '', status: '' });

  const getUniqueValues = (key) => {
    const values = jobs.map((j) => j[key]).filter((v) => v !== undefined && v !== null && v !== '');
    return [...new Set(values)].sort();
  };
  const ministryOptions = getUniqueValues('ministry');
  const divisionOptions = getUniqueValues('division');

  const filteredJobs = jobs.filter((j) => {
    if (filters.ministry && j.ministry !== filters.ministry) return false;
    if (filters.status && (j.status || 'Pending') !== filters.status) return false;
    return true;
  });

  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => !j.status || j.status === 'Pending').length;
  const approvedJobs = jobs.filter(j => j.status === 'Approved').length;
  const rejectedJobs = jobs.filter(j => j.status === 'Rejected').length;
  const totalAllocation = jobs.reduce((sum, j) => sum + parseAllocation(j.allocation), 0);
  const totalMinistries = ministryOptions.length;
  const totalDivisions = divisionOptions.length;

  const statCards = [
    { label: 'Total Allocation (Rs.)', value: totalAllocation.toLocaleString('en-US', { maximumFractionDigits: 0 }), icon: Wallet, color: 'var(--accent-primary)' },
    { label: 'Total Jobs', value: totalJobs, icon: Briefcase, color: 'var(--info)' },
    { label: 'Ministries', value: totalMinistries, icon: Landmark, color: 'var(--gold)' },
    { label: 'Divisions', value: totalDivisions, icon: Layers, color: 'var(--success)' },
    { label: 'Pending', value: pendingJobs, icon: Clock, color: 'var(--warning)' },
    { label: 'Rejected', value: rejectedJobs, icon: XCircle, color: 'var(--danger)' },
  ];

  const allocationPerMinistry = ministryOptions.map((m) => ({
    name: m,
    total: jobs.filter(j => j.ministry === m).reduce((sum, j) => sum + parseAllocation(j.allocation), 0),
  }));

  return (
    <div id="cems-user-dashboard" className={`${isDark ? 'dark-mode' : 'light-mode'} theme-${accentTheme}`}>
      <button className="sidebar-toggle-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title={isSidebarOpen ? 'Collapse Menu' : 'Expand Menu'}>
        <Menu size={20} />
      </button>

      <div className="user-dashboard-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-box">
            <div className="profile-photo"><Briefcase size={32} /></div>
            <div className="profile-info">
              <h3>Director</h3>
              <p className="reg-number">Design Branch</p>
              <span className="role-title" style={{
                fontSize: '0.68rem', color: '#ffffff', backgroundColor: 'var(--accent-primary)',
                fontWeight: '800', padding: '3px 10px', borderRadius: '12px', marginTop: '6px',
                textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block'
              }}>
                Director
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {[
              { id: 'Overview', icon: BarChart3, label: 'Overview' },
              { id: 'Records', icon: Table2, label: 'All Records' },
              { id: 'Settings', icon: Settings, label: 'Settings' },
            ].map(item => (
              <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
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

        <main className={`dashboard-content ${isSidebarOpen ? 'content-shifted-open' : 'content-shifted-closed'}`}>
          <header className="content-header"><div className="header-left" /></header>

          <motion.div className="stat-cards-grid" variants={staggerContainer} initial="hidden" animate="visible">
            {statCards.map((stat) => (
              <motion.div key={stat.label} variants={cardVariant} className="field-card" style={{ padding: '20px', cursor: 'default', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
                  }}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'Overview' && (
              <motion.section key="overview" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="project-table-section">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Landmark size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Executive Overview</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Budget allocation and status breakdown across every ministry</p>
                    </div>
                  </div>
                </div>

                {totalJobs === 0 ? (
                  <div className="placeholder-content" style={{ height: '300px' }}>
                    <AlertTriangle size={36} style={{ opacity: 0.35 }} />
                    <span>{loading ? 'Loading data...' : 'No job records found.'}</span>
                  </div>
                ) : (
                  <div className="analytics-dashboard-grid">
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
                              cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value"
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
                            <Legend verticalAlign="bottom" height={36} formatter={(value) => (
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem' }}>{value}</span>
                            )} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                          <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)', lineHeight: 1 }}>{totalJobs}</div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>Total Jobs</div>
                        </div>
                      </div>
                    </div>

                    <div className="field-card" style={{ padding: '24px 26px 28px' }}>
                      <h3 className="recent-jobs-title">Allocation by Ministry (Rs.)</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={allocationPerMinistry} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10, fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" height={70} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="var(--accent-primary)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {activeTab === 'Records' && (
              <motion.section key="records" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="project-table-section">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Table2 size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>All Records</h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Every job across every ministry and division</p>
                    </div>
                  </div>
                </div>

                <motion.div className="recent-jobs-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
                  <h3 className="recent-jobs-title">Job Register ({filteredJobs.length} of {totalJobs})</h3>

                  <div className="table-filters-row">
                    <div className="input-row-group">
                      <label><Filter size={12} /> Ministry</label>
                      <select name="ministry" value={filters.ministry} onChange={handleFilterChange} className="input-field">
                        <option value="">All Ministries</option>
                        {ministryOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
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
                    {(filters.ministry || filters.status) && (
                      <button className="cancel-btn" onClick={handleClearFilters}><X size={14} /> Clear</button>
                    )}
                  </div>

                  <div className="table-scroll-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Job No</th><th>Activity</th><th>Ministry</th><th>Division</th>
                          <th>Allocation</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.length === 0 ? (
                          <tr>
                            <td colSpan={6}>
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
                              <td>{j.division}</td>
                              <td className="font-bold">{j.allocation}</td>
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
