import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, RefreshCw, Settings, Edit3, LogOut, Save,
  Check, X, Menu, UserPlus, Undo, Trash2, Shield, Clock,
  CheckCircle, XCircle, AlertTriangle, Users, BarChart3, Wrench, Filter,
  Globe, Sun, Moon, Lightbulb, Camera, TrendingUp, Activity,
  FileText, FileSpreadsheet, Printer, MessageSquare, Send, ClipboardCheck, MapPin,
  Volume2, VolumeX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar
} from 'recharts';
import DivisionChat from '../../components/DivisionChat';
import JobTrackingTimeline from '../../components/JobTrackingTimeline';
import RiskIntelligencePanel from '../../components/RiskIntelligencePanel';
import { getHistoryActor } from '../../utils/jobTracking';
import { formatCurrency } from '../../utils/formatCurrency';
import ToastStack from '../../components/ToastStack';
import { playSound, getSoundPrefs, setSoundPrefs } from '../../utils/sounds';


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

const getRoleBadgeClass = (role) => {
  if (!role) return 'role-user';
  switch (role.toLowerCase()) {
    case 'admin': return 'status-rejected';
    case 'engineer': return 'role-engineer';
    case 'division_assistant': return 'role-division-assistant';
    case 'user': return 'role-user';
    case 'clerk': return 'role-clerk';
    default: return 'role-user';
  }
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

/* ─── Ministry colour palette ─── */
const MINISTRY_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'
];

/* ─── Division → DS Divisions Covered mapping (keys match the exact division string
   stored on the engineer's own account) ─── */
const DIVISION_DS_DIVISIONS = {
  'Anuradhapura-East': ['Nuwaragam Palatha East', 'Mihinthale', 'Kahatagasdigiliya', 'Rambewa'],
  'Anuradhapura-West': ['Nuwaragam Palatha Central', 'Nochchiyagama', 'Rajanganaya', 'Thalawa'],
  'Higurakgoda': ['Hingurakgoda', 'Medirigiriya'],
  'Kekirawa': ['Kekirawa', 'Galnewa', 'Palagala'],
  'Medawachchiya': ['Medawachchiya', 'Padaviya', 'Kebithigollewa', 'Horowpothana', 'Mahawilachchiya'],
  'Mihinthale': ['Galenbindunuwewa', 'Nachchaduwa', 'Ipalogama', 'Thirappane'],
  'Polonnaruwa': ['Thamankaduwa', 'Dimbulagala'],
  'Thambuththegama': ['Thambuttegama'],
};

/* ─── Theme persistence is scoped per-dashboard — each dashboard keeps its own
   dark/light + accent choice, independent of every other dashboard ─── */
const THEME_STORAGE_KEY = 'engineer-dashboard-theme';
const ACCENT_STORAGE_KEY = 'engineer-dashboard-accentTheme';

/* ─────────────────────────────────────── */
const EngineerDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) === 'dark');
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem(ACCENT_STORAGE_KEY) || 'violet');
  const [soundMuted, setSoundMuted] = useState(() => getSoundPrefs().muted);
  const [soundVolume, setSoundVolume] = useState(() => getSoundPrefs().volume);
  // Restored from sessionStorage so that navigating to a job's details page and clicking
  // Back returns to whichever tab the user was actually on, instead of resetting to Overview.
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('engineerDashboardActiveTab') || 'overview');
  const [jobSubTab, setJobSubTab] = useState('approvals');
  // Which status the Approval Requests table is filtered to — set by clicking a top
  // stat card (Total Jobs / Pending / Approved / Rejected) on the Overview tab.
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  // Which ministry-card pill (Total/Approved/Pending/Rejected) is currently expanded
  // on the View Progress tab, showing the matching jobs underneath — { ministry, status } or null.
  // Restored from sessionStorage so Back-navigating from a job's details page re-expands
  // the same pill instead of losing that context.
  const [expandedMinistryPill, setExpandedMinistryPill] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('engineerDashboardExpandedPill') || 'null'); }
    catch { return null; }
  });
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentDivision, setCurrentDivision] = useState(localStorage.getItem('userDivision') || '');
  // Overview's Team Resource Summary shows only the first few members by default —
  // the full system-wide user list can be long and was pushing Risk Intelligence
  // (further down the same tab) far below the fold.
  const [showAllTeam, setShowAllTeam] = useState(false);
  const TEAM_PREVIEW_COUNT = 5;
  const [totalUnread, setTotalUnread] = useState(0);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'engineer');

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
  const [allSystemUsers, setAllSystemUsers] = useState([]);
  const [userFormData, setUserFormData] = useState({
    employeeId: '',
    firstName: '',
    secondName: '',
    email: '',
    phoneNo: '',
    password: '',
    division: localStorage.getItem('userDivision') || '',
    dsDivision: '',
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

  /* ─── Chatbot state ─── */
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  // Dismiss timing/animation/sound is owned by <ToastStack> so hovering a toast can
  // genuinely pause its countdown — this just appends to the queue.
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem(THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
    addToast(`${nextDark ? 'Dark' : 'Light'} theme activated`, 'info');
  };

  /* ─── Chatbot handlers ─── */
  const formatChatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendChatMessage = async (text) => {
    const message = (text || chatInput).trim();
    if (!message || chatLoading) return;
    const division = localStorage.getItem('userDivision') || currentDivision || '';
    setChatMessages(prev => [...prev, { role: 'user', text: message, time: formatChatTime() }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/chatbot/query', { message, division });
      setChatMessages(prev => [...prev, { role: 'ai', text: res.data.response, time: formatChatTime() }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: '❌ Sorry, I could not reach the server. Please check your connection and try again.', time: formatChatTime() }]);
    }
    setChatLoading(false);
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Keep the active tab in sessionStorage so a job-details page's Back button
  // (navigate(-1)) restores this same tab instead of the dashboard remounting on Overview.
  useEffect(() => {
    sessionStorage.setItem('engineerDashboardActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('engineerDashboardExpandedPill', JSON.stringify(expandedMinistryPill));
  }, [expandedMinistryPill]);

  // Format AI markdown-like response to HTML
  const formatBotMessage = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        line = line
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
        return `<p key="${i}" style="margin:0 0 4px">${line || '&nbsp;'}</p>`;
      })
      .join('');
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
      setJobTrackingData(data);
    } catch (err) { console.error("Error fetching data:", err); }
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
          if (user.division) {
            setCurrentDivision(user.division);
            localStorage.setItem('userDivision', user.division);
          }
          if (user.role) {
            setUserRole(user.role);
            localStorage.setItem('role', user.role);
          }
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
    fetchUserProfile();
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleExport = (title, headers, rows, type) => {
    if (type === 'excel') {
      try {
        let csvContent = "";
        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
        rows.forEach(row => {
          csvContent += row.map(cell => {
            const val = cell !== undefined && cell !== null ? String(cell) : "";
            return `"${val.replace(/"/g, '""')}"`;
          }).join(",") + "\n";
        });
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        addToast(`${title} exported to Excel successfully!`, 'success');
      } catch (err) {
        console.error("Excel export error:", err);
        addToast("Failed to export Excel.", 'error');
      }
    } else if (type === 'pdf') {
      try {
        const doc = new jsPDF();
        doc.setFont("Helvetica");
        doc.setFontSize(14);
        doc.text(title, 14, 15);
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} · Division: ${currentDivision || 'N/A'}`, 14, 21);

        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 25,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241] },
          styles: { fontSize: 8, cellPadding: 3, font: 'Helvetica' },
        });
        doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
        addToast(`${title} exported to PDF successfully!`, 'success');
      } catch (err) {
        console.error("PDF export error:", err);
        addToast("Failed to export PDF.", 'error');
      }
    } else if (type === 'print') {
      try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          addToast("Popup blocked! Please allow popups to print.", 'warning');
          return;
        }
        const tableHTML = `
          <table style="width:100%; border-collapse:collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; margin-top: 15px;">
            <thead>
              <tr style="background-color:#6366f1; color:white;">
                ${headers.map(h => `<th style="padding:8px 10px; border:1px solid #ddd; text-align:left; font-weight: 700;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row, rIdx) => `
                <tr style="background-color: ${rIdx % 2 === 0 ? '#f9fafb' : '#ffffff'};">
                  ${row.map(cell => `<td style="padding:8px 10px; border:1px solid #ddd; color: #374151;">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        printWindow.document.write(`
          <html>
            <head>
              <title>Print - ${title}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 30px; color: #1f2937; }
                h2 { margin: 0 0 4px 0; color: #111827; font-size: 20px; }
                .meta { font-size: 12px; color: #6b7280; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
                @media print {
                  body { margin: 15px; }
                  thead { display: table-header-group; }
                }
              </style>
            </head>
            <body>
              <h2>${title}</h2>
              <div class="meta">Generated on: ${new Date().toLocaleString()} ${currentDivision ? `· Division: ${currentDivision}` : ''}</div>
              ${tableHTML}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } catch (err) {
        console.error("Print error:", err);
        addToast("Failed to initiate print.", 'error');
      }
    }
  };

  const renderExportButtons = (title, headers, rows) => {
    return (
      <div className="table-export-actions">
        <button onClick={() => handleExport(title, headers, rows, 'pdf')} className="export-btn pdf-export" title="Download PDF">
          <FileText size={13} /> PDF
        </button>
        <button onClick={() => handleExport(title, headers, rows, 'excel')} className="export-btn excel-export" title="Download Excel">
          <FileSpreadsheet size={13} /> Excel
        </button>
        <button onClick={() => handleExport(title, headers, rows, 'print')} className="export-btn print-export" title="Print Table">
          <Printer size={13} /> Print
        </button>
      </div>
    );
  };


  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      playSound('logout');
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY); // preserve theme across logout
      localStorage.clear();
      if (savedTheme) localStorage.setItem(THEME_STORAGE_KEY, savedTheme);
      sessionStorage.removeItem('engineerDashboardActiveTab');
      sessionStorage.removeItem('engineerDashboardExpandedPill');
      navigate('/');
    }
  };

  const startEdit = (job) => { setEditingJob(job.jobNo); setEditForm(job); };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${editForm.jobNo}`, editForm);
      setEditingJob(null);
      fetchData();
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
      await axios.patch(`http://127.0.0.1:5000/api/projects/status/${jobNo}`, {
        status,
        historyEvent: status === 'Approved' ? 'Approved by Engineer' : 'Rejected by Engineer',
        historyActor: getHistoryActor()
      });
      fetchData();
      addToast(`Job ${status.toLowerCase()} successfully!`, status === 'Approved' ? 'success' : 'warning');
    } catch (err) {
      addToast('Status update failed!', 'error');
    }
  };

  const handleUndoApproval = async (jobNo) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/projects/undo/${jobNo}`);
      fetchData();
      addToast('Status reset to Pending', 'info');
    } catch (error) { console.error("Error undoing status:", error); }
  };

  const handleEngineerReview = async (jobNo, engineerReviewStatus) => {
    let engineerReviewNote = '';
    if (engineerReviewStatus === 'Rejected') {
      const note = window.prompt('Add a review summary for the Divisional Assistant (optional):', '');
      if (note === null) return; // cancelled
      engineerReviewNote = note;
    }
    try {
      await axios.put(`http://127.0.0.1:5000/api/projects/update/${jobNo}`, {
        engineerReviewStatus,
        engineerReviewedAt: new Date().toISOString(),
        engineerReviewNote,
        historyEvent: engineerReviewStatus === 'Approved' ? 'Final estimate approved by Engineer' : 'Final estimate rejected by Engineer',
        historyActor: getHistoryActor()
      });
      fetchData();
      addToast(`Submission ${engineerReviewStatus.toLowerCase()}!`, engineerReviewStatus === 'Approved' ? 'success' : 'warning');
    } catch (err) {
      addToast('Review update failed!', 'error');
    }
  };

  const handleUndoEngineerReview = async (jobNo) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/projects/undo-engineer-review/${jobNo}`);
      fetchData();
      addToast('Engineer review reset to Pending', 'info');
    } catch (error) {
      console.error('Error undoing engineer review:', error);
      addToast('Failed to undo engineer review.', 'error');
    }
  };

  const handleAssigneeChange = async (jobNo, newAssignee) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/projects/assign/${jobNo}`, { assignee: newAssignee });
      await fetchData();
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
        console.error("Error saving engineer profile photo to backend:", err);
        addToast("Failed to sync photo to database", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === 'phoneNo' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setUserFormData({ ...userFormData, [name]: sanitized });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const payload = {
      employeeId: userFormData.employeeId,
      fullName: `${userFormData.firstName} ${userFormData.secondName || ''}`.trim(),
      email: userFormData.email,
      phoneNo: userFormData.phoneNo,
      password: userFormData.password,
      division: userFormData.division || localStorage.getItem('userDivision') || '',
      dsDivision: userFormData.dsDivision || '',
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
        phoneNo: '',
        password: '',
        division: localStorage.getItem('userDivision') || '',
        dsDivision: '',
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

  /* ─── Computed stats (division-scoped) ─── */
  // Memoized: each of these does a full pass over approvalData/jobTrackingData, so without
  // useMemo they'd re-run on every render — including renders from unrelated UI state like
  // typing in a filter box or toggling a modal.
  const totalDivisionJobs = approvalData.length;
  const pendingApprovals = React.useMemo(() => approvalData.filter(j => !j.status || j.status === 'Pending').length, [approvalData]);
  const approvedCount = React.useMemo(() => approvalData.filter(j => j.status === 'Approved').length, [approvalData]);
  const rejectedCount = React.useMemo(() => approvalData.filter(j => j.status === 'Rejected').length, [approvalData]);

  /* ─── Assignee table only shows jobs approved in the Approval Requests tab ─── */
  const trackedJobs = React.useMemo(() => jobTrackingData.filter(j => j.status === 'Approved'), [jobTrackingData]);

  /* ─── Final estimates submitted by users, awaiting Engineer review — only surfaces once
       the Divisional Assistant has approved the submission (daReviewStatus gate) ─── */
  const daApprovedJobs = React.useMemo(() => approvalData.filter(j => j.finalEstimateCost != null && j.daReviewStatus === 'Approved'), [approvalData]);
  const pendingDaReviewCount = React.useMemo(() => daApprovedJobs.filter(j => (j.engineerReviewStatus || 'Pending') === 'Pending').length, [daApprovedJobs]);

  /* ─── Drawing Tracking: read-only progress of drawing requests in this division ─── */
  const drawingTrackingJobs = React.useMemo(() => approvalData.filter(j => j.drawingWorkflowStatus && j.drawingWorkflowStatus !== 'NotRequested'), [approvalData]);
  const getDrawingTrackingInfo = (j) => {
    if (j.drawingWorkflowStatus === 'PendingDA') {
      if (j.drawingDaStatus === 'Rejected') return { label: 'Rejected by DA', badge: 'status-rejected' };
      return { label: 'Pending DA Review', badge: 'status-pending' };
    }
    if (j.drawingWorkflowStatus === 'PendingDirectorAssignment') return { label: 'With Design Director', badge: 'status-pending' };
    if (j.drawingWorkflowStatus === 'PendingEngineerDesign') {
      return { label: j.assignedDesignEngineerName ? `Assigned to ${j.assignedDesignEngineerName}` : 'Assigned to Engineer', badge: 'status-pending' };
    }
    if (j.drawingWorkflowStatus === 'PendingDirectorDesign') return { label: 'Awaiting Director Approval', badge: 'status-pending' };
    if (j.drawingWorkflowStatus === 'Completed') return { label: 'Drawing Sent to User', badge: 'status-approved' };
    return { label: 'Not Requested', badge: 'status-pending' };
  };

  const statCards = [
    { label: 'Total Jobs', filter: 'all', value: totalDivisionJobs, icon: Briefcase, color: 'var(--accent-primary)' },
    { label: 'Pending', filter: 'Pending', value: pendingApprovals, icon: Clock, color: 'var(--warning)' },
    { label: 'Approved', filter: 'Approved', value: approvedCount, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Rejected', filter: 'Rejected', value: rejectedCount, icon: XCircle, color: 'var(--danger)' },
  ];

  const handleStatCardClick = (filter) => {
    setJobStatusFilter(filter);
    setActiveTab('my-jobs');
    setJobSubTab('approvals');
  };

  /* ─── Progress data: per-ministry grouped from division jobs ─── */
  const ministryProgressData = React.useMemo(() => {
    const map = {};
    approvalData.forEach(job => {
      const m = job.ministry || 'Other';
      if (!map[m]) map[m] = { ministry: m, total: 0, approved: 0, pending: 0, rejected: 0, departments: {} };
      map[m].total++;
      if (job.status === 'Approved') map[m].approved++;
      else if (job.status === 'Rejected') map[m].rejected++;
      else map[m].pending++;

      const d = job.department || 'General';
      if (!map[m].departments[d]) map[m].departments[d] = { dept: d, total: 0, approved: 0, pending: 0, rejected: 0 };
      map[m].departments[d].total++;
      if (job.status === 'Approved') map[m].departments[d].approved++;
      else if (job.status === 'Rejected') map[m].departments[d].rejected++;
      else map[m].departments[d].pending++;
    });
    return Object.values(map).map(m => ({
      ...m,
      completionRate: m.total > 0 ? Math.round((m.approved / m.total) * 100) : 0,
      departments: Object.values(m.departments)
    }));
  }, [approvalData]);

  /* ─── Compute Smart Suggestions & Recommendations ─── */
  // Memoized: this is an O(users × jobs) nested pass, the most expensive derived value here.
  const usersWithJobs = React.useMemo(() => allSystemUsers.map(user => {
    const name = user.fullName || `${user.firstName || ''} ${user.secondName || ''}`.trim();
    const jobCount = approvalData.filter(job => job.assignee === name && job.status !== 'Approved' && job.status !== 'Rejected').length;
    return {
      ...user,
      displayName: name || 'Unnamed User',
      jobCount
    };
  }), [allSystemUsers, approvalData]);

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

  /* ─── Tabs that show stat cards ─── */
  const showStatCards = activeTab === 'overview' || activeTab === 'my-jobs';  // not on messages

  return (
    <div id="cems-user-dashboard" className={`${isDark ? 'dark-mode' : 'light-mode'} theme-${accentTheme}`}>
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
            <div className="profile-info">
              {currentDivision && (
                <span className="profile-division" style={{
                  fontSize: '0.7rem',
                  color: 'var(--accent-primary)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '2px',
                  display: 'block'
                }}>
                  {currentDivision}
                </span>
              )}
              <h3>{profileData.name}</h3>
              <p className="reg-number">{profileData.reg}</p>
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
                {formatRoleName(userRole || 'engineer')}
              </span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'my-jobs', icon: Briefcase, label: 'My Jobs' },
              { id: 'all-jobs', icon: Globe, label: 'All Jobs' },
              { id: 'drawing-tracking', icon: Clock, label: 'Drawing Tracking' },
              { id: 'review-da', icon: ClipboardCheck, label: 'Review Final Estimates' },
              { id: 'job-tracking', icon: MapPin, label: 'Job Tracking' },
              { id: 'add-user', icon: UserPlus, label: 'Add User' },
              { id: 'view-progress', icon: TrendingUp, label: 'View Progress' },
              { id: 'ai-chatbot', icon: MessageSquare, label: 'AI Assistant' },
              { id: 'messages', icon: Send, label: 'Messages' },
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
                {item.id === 'review-da' && pendingDaReviewCount > 0 && (
                  <span className="nav-unread-badge">{pendingDaReviewCount > 99 ? '99+' : pendingDaReviewCount}</span>
                )}
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
              className={`division-banner ${activeTab === 'add-user' ? 'division-banner-narrow' : ''}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Shield size={18} /> {currentDivision} Division
            </motion.div>
          )}

          {/* ─── Stat Cards – only on overview & my-jobs ─── */}
          {showStatCards && (
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
                  style={{ padding: '20px', cursor: 'pointer' }}
                  onClick={() => handleStatCardClick(stat.filter)}
                  title={`View ${stat.label.toLowerCase()}`}
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
            {activeTab === 'overview' && (() => {
              const maxWorkload = Math.max(1, ...usersWithJobs.map(u => u.jobCount));
              const statusSlices = [
                { name: 'Approved', value: approvedCount, color: '#10b981' },
                { name: 'Pending', value: pendingApprovals, color: '#f59e0b' },
                { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
              ].filter(d => d.value > 0);

              return (
              <motion.div key="overview" variants={pageVariants} initial="hidden" animate="visible" exit="exit">

                {/* ── Charts Row ── */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}
                >
                  {/* Donut: Division status breakdown */}
                  <motion.div variants={cardVariant} whileHover={{ y: -3 }} className="field-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Division Status Breakdown</h3>
                    </div>
                    {totalDivisionJobs === 0 ? (
                      <div className="placeholder-content" style={{ height: '240px', border: 'none' }}>
                        <BarChart3 size={28} style={{ opacity: 0.35 }} />
                        <span>No jobs found for your division yet.</span>
                      </div>
                    ) : (
                      <div style={{ position: 'relative', width: '100%', height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusSlices}
                              cx="50%" cy="45%"
                              innerRadius={58} outerRadius={86}
                              paddingAngle={4} dataKey="value"
                              isAnimationActive animationDuration={700}
                            >
                              {statusSlices.map((entry, i) => (
                                <Cell key={`ov-status-cell-${i}`} fill={entry.color} />
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
                          <div style={{ fontSize: '1.9rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)', lineHeight: 1 }}>
                            {totalDivisionJobs}
                          </div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '3px' }}>
                            Total Jobs
                          </div>
                        </div>
                      </div>
                    )}
                    {statusSlices.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {statusSlices.map((s) => (
                          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.name}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: s.color }}>
                              - {s.value} ({totalDivisionJobs > 0 ? Math.round((s.value / totalDivisionJobs) * 100) : 0}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                  {/* Left Column: Team & Resource Directory */}
                  <motion.div variants={cardVariant} initial="hidden" animate="visible" whileHover={{ y: -3 }} className="field-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={20} style={{ color: 'var(--accent-primary)' }} />
                        <h3 className="recent-jobs-title" style={{ margin: 0 }}>Team Resource Summary</h3>
                      </div>
                      {renderExportButtons(
                        "Team Resource Summary",
                        ["Serial No", "User Name", "Position", "Division", "Active Jobs"],
                        usersWithJobs.map((u, index) => [index + 1, u.displayName, formatRoleName(u.role), u.division || 'Head Office', u.jobCount])
                      )}
                    </div>
                    <div className="table-scroll-wrapper">
                      <table className="project-table">
                        <thead>
                          <tr>
                            <th>Serial No</th>
                            <th>User Name</th>
                            <th>Position</th>
                            <th>Division</th>
                            <th style={{ minWidth: '140px' }}>Active Jobs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersWithJobs.length === 0 ? (
                            <tr>
                              <td colSpan={5}>
                                <div className="placeholder-content" style={{ height: '100px', border: 'none' }}>
                                  <span>No system users registered.</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            (showAllTeam ? usersWithJobs : usersWithJobs.slice(0, TEAM_PREVIEW_COUNT)).map((user, index) => (
                              <tr key={user._id}>
                                <td>{index + 1}</td>
                                <td className="font-bold">{user.displayName}</td>
                                <td>
                                  <span className={`status-badge ${getRoleBadgeClass(user.role)}`}>
                                    {formatRoleName(user.role)}
                                  </span>
                                </td>
                                <td>{user.division || 'Head Office'}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ flex: 1, height: '5px', borderRadius: '99px', background: 'var(--border-base)', minWidth: '52px' }}>
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(user.jobCount / maxWorkload) * 100}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        style={{ height: '100%', borderRadius: '99px', background: 'var(--accent-primary)' }}
                                      />
                                    </div>
                                    <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.85rem', minWidth: '16px', textAlign: 'right' }}>{user.jobCount}</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {usersWithJobs.length > TEAM_PREVIEW_COUNT && (
                      <button
                        type="button"
                        onClick={() => setShowAllTeam(v => !v)}
                        style={{
                          marginTop: '12px', width: '100%', padding: '10px', borderRadius: 'var(--radius-btn)',
                          border: '1.5px solid var(--border-base)', background: 'var(--bg-input)',
                          color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.82rem',
                          fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                        }}
                      >
                        {showAllTeam ? 'Show Less' : `View All ${usersWithJobs.length} Members`}
                      </button>
                    )}
                  </motion.div>

                  {/* Right Column: AI Suggestions */}
                  <motion.div variants={cardVariant} initial="hidden" animate="visible" whileHover={{ y: -3 }} className="field-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Lightbulb size={20} style={{ color: '#d97706' }} />
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Allocation suggestions</h3>
                    </div>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                      {recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          variants={cardVariant}
                          whileHover={{ x: 3 }}
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
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>

                </div>

                <RiskIntelligencePanel division={currentDivision || undefined} />
              </motion.div>
              );
            })()}

            {/* ── My Jobs Tab ── */}
            {activeTab === 'my-jobs' && (
              <motion.div key="my-jobs" variants={pageVariants} initial="hidden" animate="visible" exit="exit">

                {/* Sub-tabs */}
                <div className="sub-tabs">
                  <button
                    className={jobSubTab === 'approvals' ? 'active-sub-tab' : ''}
                    onClick={() => setJobSubTab('approvals')}
                  >
                    <CheckCircle size={14} style={{ marginRight: '6px' }} /> Approval Requests
                  </button>
                  <button
                    className={jobSubTab === 'tracking' ? 'active-sub-tab' : ''}
                    onClick={() => setJobSubTab('tracking')}
                  >
                    <Users size={14} style={{ marginRight: '6px' }} /> Assignee
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* Approvals sub-tab */}
                  {jobSubTab === 'approvals' && (() => {
                    const filteredApprovalData = jobStatusFilter === 'all'
                      ? approvalData
                      : approvalData.filter(job => (job.status || 'Pending') === jobStatusFilter);
                    return (
                    <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      {jobStatusFilter !== 'all' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                          <span className={`status-badge status-${jobStatusFilter.toLowerCase()}`}>
                            Filtered — {jobStatusFilter}
                          </span>
                          <button className="cancel-btn" onClick={() => setJobStatusFilter('all')}>
                            Clear filter
                          </button>
                        </div>
                      )}
                      {renderExportButtons(
                        "Approval Requests",
                        ["No", "Estimation Number", "Job Name", "Date of Request", "Allocation", "Status"],
                        filteredApprovalData.map((job, idx) => [idx + 1, job.estimationNo || '—', job.jobName, formatDate(job.dateReq), job.allocation, job.status || 'Pending'])
                      )}
                      <div className="table-scroll-wrapper">
                        <table className="project-table">
                          <thead>
                            <tr><th>No</th><th>Estimation Number</th><th>Job Name</th><th>Date of Request</th><th>Allocation</th><th>Approval</th></tr>
                          </thead>
                          <tbody>
                            {filteredApprovalData.length === 0 ? (
                              <tr>
                                <td colSpan={6}>
                                  <div className="placeholder-content" style={{ height: '140px', border: 'none' }}>
                                    <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                                    <span>{jobStatusFilter === 'all' ? 'No approval requests found' : `No ${jobStatusFilter.toLowerCase()} jobs.`}</span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              filteredApprovalData.map((job, idx) => (
                                <tr key={job.jobNo}>
                                  <td>{idx + 1}</td>
                                  <td className="font-mono">{job.estimationNo || '—'}</td>
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
                    );
                  })()}

                  {/* Tracking / Assignee sub-tab */}
                  {jobSubTab === 'tracking' && (
                    <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      {renderExportButtons(
                        "Assignee Tracking",
                        ["No", "Estimation Number", "Division", "Job Name", "Allocation", "Assignee"],
                        trackedJobs.map((job, idx) => [idx + 1, job.estimationNo || '—', job.division, job.jobName, job.allocation, job.assignee || 'Unassigned'])
                      )}
                      <div className="table-scroll-wrapper">
                        <table className="project-table">
                          <thead>
                            <tr><th>Serial No</th><th>Estimation Number</th><th>Division</th><th>Job Name</th><th>Allocation</th><th>Assignee</th><th>Action</th></tr>
                          </thead>
                          <tbody>
                            {trackedJobs.length === 0 ? (
                              <tr>
                                <td colSpan={7}>
                                  <div className="placeholder-content" style={{ height: '140px', border: 'none' }}>
                                    <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                                    <span>No jobs to track</span>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              trackedJobs.map((job, idx) => (
                                <tr key={job.jobNo}>
                                  <td>{idx + 1}</td>
                                  <td className="font-mono">{job.estimationNo || '—'}</td>
                                  <td>{job.division}</td>
                                  <td className="font-bold">{job.jobName}</td>
                                  <td>{job.allocation}</td>
                                  <td>
                                    <select value={job.assignee || ""} onChange={(e) => handleAssigneeChange(job.jobNo, e.target.value)}>
                                      <option value="" disabled>Select Assignee</option>
                                      {allSystemUsers
                                        .filter((user) => user.role === 'user'
                                          && (user.division || '').trim().toLowerCase() === (currentDivision || '').trim().toLowerCase())
                                        .map((user) => {
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
                              <input value={editForm.jobName} onChange={(e) => setEditForm({ ...editForm, jobName: e.target.value })} placeholder="Job Name" />
                              <label>Allocation</label>
                              <input value={editForm.allocation} onChange={(e) => setEditForm({ ...editForm, allocation: e.target.value })} placeholder="Allocation" />
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

            {/* ── All Jobs Tab – Division-scoped only ── */}
            {activeTab === 'all-jobs' && (
              <motion.div key="all-jobs" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div className="field-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Globe size={20} style={{ color: 'var(--accent-primary)' }} />
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>
                        {currentDivision ? `${currentDivision} – All Jobs` : 'All Jobs'}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {renderExportButtons(
                        "All Division Jobs",
                        ["No", "Estimation Number", "Job Name", "Ministry", "Department", "Allocation", "Assignee", "Status"],
                        approvalData.map(job => [job.sNo, job.estimationNo || '—', job.jobName, job.ministry, job.department, job.allocation, job.assignee || 'Unassigned', job.status || 'Pending'])
                      )}
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Showing {approvalData.length} job{approvalData.length !== 1 ? 's' : ''} for your division
                      </span>
                    </div>
                  </div>

                  <div className="table-scroll-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Estimation Number</th>
                          <th>Job Name</th>
                          <th>Ministry</th>
                          <th>Department</th>
                          <th>Allocation</th>
                          <th>Assignee</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvalData.length === 0 ? (
                          <tr>
                            <td colSpan={8}>
                              <div className="placeholder-content" style={{ height: '140px', border: 'none' }}>
                                <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                                <span>No jobs found for your division.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          approvalData.map((job) => (
                            <tr
                              key={job.jobNo}
                              onClick={() => navigate(`/design/job/${job.jobNo}`, { state: { job } })}
                              style={{ cursor: 'pointer' }}
                              title="Click to view full job details"
                            >
                              <td>{job.sNo}</td>
                              <td className="font-mono">{job.estimationNo || '—'}</td>
                              <td className="font-bold">{job.jobName}</td>
                              <td>{job.ministry}</td>
                              <td>{job.department}</td>
                              <td>{job.allocation}</td>
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

            {/* ── Drawing Tracking Tab: read-only view of every drawing request's progress ── */}
            {activeTab === 'drawing-tracking' && (
              <motion.div key="drawing-tracking" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div className="field-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={20} style={{ color: 'var(--accent-primary)' }} />
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>
                        {currentDivision ? `${currentDivision} – Drawing Tracking` : 'Drawing Tracking'}
                      </h3>
                    </div>
                    {renderExportButtons(
                      "Drawing Tracking",
                      ["Serial No", "Estimation Number", "Job Name", "Requested On", "Status"],
                      drawingTrackingJobs.map((job, index) => {
                        const info = getDrawingTrackingInfo(job);
                        return [
                          index + 1,
                          job.estimationNo || '—',
                          job.jobName,
                          job.drawingRequestedAt ? new Date(job.drawingRequestedAt).toLocaleDateString() : 'N/A',
                          info.label
                        ];
                      })
                    )}
                  </div>
                  <p style={{ margin: '-14px 0 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Progress of every drawing request in your division, from the initial request through to the user receiving it
                  </p>

                  <div className="table-scroll-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Serial No</th>
                          <th>Estimation Number</th>
                          <th>Job Name</th>
                          <th>Requested On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drawingTrackingJobs.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <div className="placeholder-content" style={{ height: '140px', border: 'none' }}>
                                <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                                <span>No drawing requests yet.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          drawingTrackingJobs.map((job, index) => {
                            const info = getDrawingTrackingInfo(job);
                            return (
                              <tr key={job.jobNo}>
                                <td>{index + 1}</td>
                                <td className="font-mono">{job.estimationNo || '—'}</td>
                                <td className="font-bold">{job.jobName}</td>
                                <td>{job.drawingRequestedAt ? new Date(job.drawingRequestedAt).toLocaleDateString() : 'N/A'}</td>
                                <td><span className={`status-badge ${info.badge}`}>{info.label}</span></td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Review Final Estimates Tab ── */}
            {activeTab === 'review-da' && (
              <motion.div key="review-da" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div className="field-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ClipboardCheck size={20} style={{ color: 'var(--accent-primary)' }} />
                      <h3 className="recent-jobs-title" style={{ margin: 0 }}>Review Final Estimates</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Final estimates submitted by users, awaiting your review — click a row for full project details
                      </span>
                      {renderExportButtons(
                        "Review Final Estimates",
                        ["Serial No", "Estimation Number", "Job Name", "Submitted By", "Estimate Cost (LKR)", "Alignment Date", "Drawing Approved On", "Design Engineer", "Engineer Review"],
                        daApprovedJobs.map((job, index) => [
                          index + 1,
                          job.estimationNo || '—',
                          job.jobName,
                          job.assignee || '—',
                          job.finalEstimateCost != null ? formatCurrency(job.finalEstimateCost) : '',
                          job.finalEstimateDate ? formatDate(job.finalEstimateDate) : 'N/A',
                          job.directorApprovedAt ? formatDate(job.directorApprovedAt) : 'N/A',
                          job.assignedDesignEngineerName || '—',
                          job.engineerReviewStatus || 'Pending'
                        ])
                      )}
                    </div>
                  </div>

                  <div className="table-scroll-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Serial No</th>
                          <th>Estimation Number</th>
                          <th>Job Name</th>
                          <th>Submitted By</th>
                          <th>Estimate Cost (LKR)</th>
                          <th>Alignment Date</th>
                          <th>Drawing Approved On</th>
                          <th>Design Engineer</th>
                          <th>Engineer Review</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daApprovedJobs.length === 0 ? (
                          <tr>
                            <td colSpan={9}>
                              <div className="placeholder-content" style={{ height: '140px', border: 'none' }}>
                                <ClipboardCheck size={24} style={{ opacity: 0.35 }} />
                                <span>No submitted final estimates waiting for review.</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          daApprovedJobs.map((job, index) => (
                            <tr
                              key={job.jobNo}
                              onClick={() => navigate(`/design/job/${job.jobNo}`, { state: { job } })}
                              style={{ cursor: 'pointer' }}
                              title="Click to view full job details"
                            >
                              <td>{index + 1}</td>
                              <td className="font-mono">{job.estimationNo || '—'}</td>
                              <td className="font-bold">{job.jobName}</td>
                              <td>{job.assignee || '—'}</td>
                              <td className="font-bold">{job.finalEstimateCost != null ? formatCurrency(job.finalEstimateCost) : ''}</td>
                              <td>{job.finalEstimateDate ? formatDate(job.finalEstimateDate) : 'N/A'}</td>
                              <td>{job.directorApprovedAt ? formatDate(job.directorApprovedAt) : 'N/A'}</td>
                              <td>{job.assignedDesignEngineerName || '—'}</td>
                              <td onClick={(e) => e.stopPropagation()}>
                                {(job.engineerReviewStatus || 'Pending') === 'Pending' ? (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button className="approve-btn" onClick={() => handleEngineerReview(job.jobNo, 'Approved')} title="Approve">
                                      <Check size={15} />
                                    </button>
                                    <button className="reject-btn" onClick={() => handleEngineerReview(job.jobNo, 'Rejected')} title="Reject">
                                      <X size={15} />
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span className={`status-badge status-${job.engineerReviewStatus.toLowerCase()}`}>
                                        {job.engineerReviewStatus}
                                      </span>
                                      <button
                                        className="undo-review-btn"
                                        onClick={() => handleUndoEngineerReview(job.jobNo)}
                                        title="Undo review"
                                      >
                                        <Undo size={12} /> Undo
                                      </button>
                                    </div>
                                    {job.engineerReviewStatus === 'Rejected' && job.engineerReviewNote && (
                                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '220px' }}>"{job.engineerReviewNote}"</div>
                                    )}
                                  </div>
                                )}
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

            {/* ── Job Tracking Tab ── */}
            {activeTab === 'job-tracking' && (
              <motion.div key="job-tracking" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <JobTrackingTimeline jobs={approvalData} />
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
                    <label>Phone Number</label>
                    <input type="tel" inputMode="numeric" maxLength={10} name="phoneNo" value={userFormData.phoneNo} onChange={handleUserFormChange} />
                    <label>Password *</label>
                    <input type="password" name="password" value={userFormData.password} onChange={handleUserFormChange} required />
                    <label>Division *</label>
                    <input name="division" value={userFormData.division} disabled className="input-field" style={{ opacity: 0.7, cursor: 'not-allowed', maxWidth: '220px', width: '220px' }} />
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <h3 className="recent-jobs-title" style={{ margin: 0 }}>
                      <Users size={18} /> System Users
                    </h3>
                    {renderExportButtons(
                      "System Users",
                      ["#", "Employee ID", "Name", "Email", "Division", "Position"],
                      allSystemUsers.map((user, i) => [i + 1, user.employeeId, user.fullName, user.email, user.division, formatRoleName(user.role)])
                    )}
                  </div>
                  <div className="table-scroll-wrapper">
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
                                    onChange={e => setEditUserForm({ ...editUserForm, employeeId: e.target.value })}
                                    className="input-field"
                                  />
                                ) : <span className="font-mono">{user.employeeId}</span>}
                              </td>
                              <td>
                                {editingUser === user._id ? (
                                  <input
                                    value={editUserForm.fullName || ''}
                                    onChange={e => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                                    className="input-field"
                                  />
                                ) : <span className="font-bold">{user.fullName}</span>}
                              </td>
                              <td>
                                {editingUser === user._id ? (
                                  <input
                                    value={editUserForm.email || ''}
                                    onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
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
                                    onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}
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
                                    {!(user.role?.toLowerCase() === 'engineer' && user.division && user.division.toLowerCase() === currentDivision.toLowerCase()) && (
                                      <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>
                                        <Trash2 size={14} />
                                      </button>
                                    )}
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
                          backgroundColor: 'var(--engineer-color, #06b6d4)',
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
                          e.currentTarget.style.backgroundColor = 'var(--engineer-color-hover, #0891b2)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.backgroundColor = 'var(--engineer-color, #06b6d4)';
                        }}
                        title="Change profile photo"
                      >
                        <Camera size={14} />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}><Edit3 size={18} /> Personal Details</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Update your user credentials</p>
                    </div>
                  </div>
                  <div className="profile-form">
                    <label>Full Name</label>
                    <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                    <label>Employee ID</label>
                    <input value={profileForm.reg} onChange={(e) => setProfileForm({ ...profileForm, reg: e.target.value })} />
                    <label>Email</label>
                    <input value={profileForm.email || ''} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                    <label>Phone</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={profileForm.phone || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    />
                  </div>
                  <div className="action-buttons">
                    <button className="confirm-btn" onClick={handleSaveProfile}><Save size={14} /> Confirm</button>
                    <button className="cancel-btn" onClick={() => setActiveTab('my-jobs')}><X size={14} /> Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── View Progress Tab ── */}
            {activeTab === 'view-progress' && (
              <motion.div key="view-progress" variants={pageVariants} initial="hidden" animate="visible" exit="exit">

                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                        {currentDivision ? `${currentDivision} – Progress Report` : 'Division Progress Report'}
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Showing progress across all ministries & departments in your division
                      </p>
                    </div>
                  </div>
                </div>

                {approvalData.length === 0 ? (
                  <div className="placeholder-content" style={{ height: '300px' }}>
                    <BarChart3 size={36} style={{ opacity: 0.35 }} />
                    <span>No jobs found for your division yet.</span>
                  </div>
                ) : (
                  <>
                    {/* ── Overall Summary Cards ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                      {[
                        { label: 'Total Jobs', value: totalDivisionJobs, color: '#6366f1', pct: 100 },
                        { label: 'Approved', value: approvedCount, color: '#10b981', pct: totalDivisionJobs > 0 ? Math.round((approvedCount / totalDivisionJobs) * 100) : 0 },
                        { label: 'Pending', value: pendingApprovals, color: '#f59e0b', pct: totalDivisionJobs > 0 ? Math.round((pendingApprovals / totalDivisionJobs) * 100) : 0 },
                        { label: 'Rejected', value: rejectedCount, color: '#ef4444', pct: totalDivisionJobs > 0 ? Math.round((rejectedCount / totalDivisionJobs) * 100) : 0 },
                      ].map(s => (
                        <div key={s.label} className="field-card" style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: s.color, lineHeight: 1 }}>{s.value}</div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '4px' }}>{s.label}</div>
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, opacity: 0.75 }}>{s.pct}%</div>
                          </div>
                          {/* mini progress bar */}
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
                          <h3 className="recent-jobs-title" style={{ margin: 0 }}>Overall Status Breakdown</h3>
                        </div>
                        <div style={{ position: 'relative', width: '100%', height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Approved', value: approvedCount, color: '#10b981' },
                                  { name: 'Pending', value: pendingApprovals, color: '#f59e0b' },
                                  { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
                                ].filter(d => d.value > 0)}
                                cx="50%" cy="45%"
                                innerRadius={60} outerRadius={90}
                                paddingAngle={4} dataKey="value"
                              >
                                {[
                                  { name: 'Approved', value: approvedCount, color: '#10b981' },
                                  { name: 'Pending', value: pendingApprovals, color: '#f59e0b' },
                                  { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
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
                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: 'var(--text-primary)', lineHeight: 1 }}>
                              {totalDivisionJobs}
                            </div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginTop: '3px' }}>
                              Total
                            </div>
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
                              data={ministryProgressData.map((m, i) => ({ name: m.ministry.replace('MINISTRY OF ', '').replace('CHIEF ', 'CHIEF\n'), total: m.total, approved: m.approved, pending: m.pending, rejected: m.rejected, color: MINISTRY_COLORS[i % MINISTRY_COLORS.length] }))}
                              margin={{ top: 10, right: 10, left: -20, bottom: 60 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 9, fontWeight: 600 }} angle={-35} textAnchor="end" interval={0} />
                              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                              <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                              <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                              <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* ── Per-Ministry Progress Details ── */}
                    {ministryProgressData.map((ministry, mIdx) => (
                      <div key={ministry.ministry} className="field-card" style={{ padding: '24px', marginBottom: '20px' }}>
                        {/* Ministry Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${MINISTRY_COLORS[mIdx % MINISTRY_COLORS.length]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Shield size={18} style={{ color: MINISTRY_COLORS[mIdx % MINISTRY_COLORS.length] }} />
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{ministry.ministry}</h4>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ministry.total} total jobs · {ministry.completionRate}% approved</p>
                            </div>
                          </div>
                          {/* Overall progress bar for ministry */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px' }}>
                            <div style={{ flex: 1, height: '8px', borderRadius: '99px', background: 'var(--border-base)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, #10b981, ${MINISTRY_COLORS[mIdx % MINISTRY_COLORS.length]})`, width: `${ministry.completionRate}%`, transition: 'width 0.7s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: MINISTRY_COLORS[mIdx % MINISTRY_COLORS.length], minWidth: '36px' }}>{ministry.completionRate}%</span>
                          </div>
                        </div>

                        {/* Status pills row — click a pill to see which jobs make up that count */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          {[
                            { label: 'Total', value: ministry.total, color: '#6366f1' },
                            { label: 'Approved', value: ministry.approved, color: '#10b981' },
                            { label: 'Pending', value: ministry.pending, color: '#f59e0b' },
                            { label: 'Rejected', value: ministry.rejected, color: '#ef4444' },
                          ].map(pill => {
                            const isActive = expandedMinistryPill?.ministry === ministry.ministry && expandedMinistryPill?.status === pill.label;
                            return (
                              <button
                                key={pill.label}
                                type="button"
                                onClick={() => setExpandedMinistryPill(isActive ? null : { ministry: ministry.ministry, status: pill.label })}
                                title={`Show ${pill.label.toLowerCase()} jobs`}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '99px',
                                  background: isActive ? pill.color : `${pill.color}18`,
                                  border: `1px solid ${pill.color}${isActive ? '' : '30'}`,
                                  cursor: 'pointer', transition: 'background 0.2s ease'
                                }}
                              >
                                <span style={{ fontWeight: 900, color: isActive ? '#fff' : pill.color, fontSize: '0.95rem' }}>{pill.value}</span>
                                <span style={{ fontWeight: 600, color: isActive ? '#fff' : 'var(--text-secondary)', fontSize: '0.75rem' }}>{pill.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Expanded job list for the selected pill */}
                        <AnimatePresence>
                          {expandedMinistryPill?.ministry === ministry.ministry && (() => {
                            const pillJobs = approvalData.filter(j =>
                              (j.ministry || 'Other') === ministry.ministry &&
                              (expandedMinistryPill.status === 'Total' || (j.status || 'Pending') === expandedMinistryPill.status)
                            );
                            return (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                style={{ overflow: 'hidden', marginBottom: '20px' }}
                              >
                                <div style={{ borderRadius: '12px', border: '1px solid var(--border-base)', background: 'var(--bg-subtle, rgba(0,0,0,0.03))', padding: '12px' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                                    {expandedMinistryPill.status} jobs in {ministry.ministry} ({pillJobs.length})
                                  </div>
                                  {pillJobs.length === 0 ? (
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '8px 0' }}>No jobs match this status.</div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {pillJobs.map(job => (
                                        <div
                                          key={job.jobNo}
                                          onClick={() => navigate(`/design/job/${job.jobNo}`, { state: { job } })}
                                          style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                                            padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-card)',
                                            border: '1px solid var(--border-light)', cursor: 'pointer'
                                          }}
                                          title="Click to view full job details"
                                        >
                                          <div style={{ minWidth: 0 }}>
                                            <div className="font-bold" style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.jobName}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                              {job.estimationNo || '—'} · {job.department || 'General'}
                                            </div>
                                          </div>
                                          <span className={`status-badge status-${job.status ? job.status.toLowerCase() : 'pending'}`} style={{ flexShrink: 0 }}>
                                            {job.status || 'Pending'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>

                        {/* Department breakdown */}
                        {ministry.departments.length > 0 && (
                          <>
                            <h5 style={{ margin: '0 0 14px', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)' }}>
                              Department Breakdown
                            </h5>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                              {ministry.departments.map((dept, dIdx) => {
                                const deptRate = dept.total > 0 ? Math.round((dept.approved / dept.total) * 100) : 0;
                                return (
                                  <div key={dept.dept} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-subtle, rgba(0,0,0,0.03))', border: '1px solid var(--border-base)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1, marginRight: '8px' }}>{dept.dept}</div>
                                      <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#10b981', flexShrink: 0 }}>{deptRate}%</div>
                                    </div>
                                    {/* Stacked bar */}
                                    <div style={{ display: 'flex', height: '8px', borderRadius: '99px', overflow: 'hidden', background: 'var(--border-base)', marginBottom: '10px' }}>
                                      {dept.approved > 0 && <div style={{ flex: dept.approved, background: '#10b981' }} title={`Approved: ${dept.approved}`} />}
                                      {dept.pending > 0 && <div style={{ flex: dept.pending, background: '#f59e0b' }} title={`Pending: ${dept.pending}`} />}
                                      {dept.rejected > 0 && <div style={{ flex: dept.rejected, background: '#ef4444' }} title={`Rejected: ${dept.rejected}`} />}
                                    </div>
                                    {/* Mini counts */}
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                      <span style={{ color: '#10b981' }}>✓ {dept.approved}</span>
                                      <span style={{ color: '#f59e0b' }}>⏳ {dept.pending}</span>
                                      <span style={{ color: '#ef4444' }}>✕ {dept.rejected}</span>
                                      <span style={{ marginLeft: 'auto', color: 'var(--text-label)' }}>{dept.total} total</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}
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
                        localStorage.setItem(THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
                      }}
                      className="job-select-dropdown"
                    >
                      <option value="Light Mode">Light Mode</option>
                      <option value="Dark Mode">Dark Mode</option>
                    </select>

                    <label style={{ marginTop: '16px' }}>Accent Color</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {THEME_OPTIONS.map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setAccentTheme(theme.id);
                            localStorage.setItem(ACCENT_STORAGE_KEY, theme.id);
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

                    <label style={{ marginTop: '16px' }}>Sound Effects</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px' }}>
                      <button
                        type="button"
                        className="action-btn-pill secondary"
                        onClick={() => {
                          const next = setSoundPrefs({ muted: !soundMuted });
                          setSoundMuted(next.muted);
                          if (!next.muted) playSound('toggle');
                        }}
                      >
                        {soundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />} {soundMuted ? 'Muted' : 'On'}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={soundVolume}
                        disabled={soundMuted}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setSoundVolume(v);
                          setSoundPrefs({ volume: v });
                        }}
                        onMouseUp={() => playSound('info')}
                        style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                      />
                    </div>

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

            {/* ── AI Chatbot Tab ── */}
            {activeTab === 'ai-chatbot' && (
              <motion.div key="ai-chatbot" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                <div className="chatbot-wrapper">

                  {/* Header */}
                  <div className="chatbot-header">
                    <div className="chatbot-header-icon">
                      <MessageSquare size={22} />
                    </div>
                    <div className="chatbot-header-info" style={{ flex: 1 }}>
                      <p className="chatbot-header-title">CEMS AI Assistant</p>
                      <p className="chatbot-header-subtitle">
                        {currentDivision ? `${currentDivision} Division` : 'Engineer Dashboard'} · Smart Insights
                      </p>
                    </div>
                    <div className="chatbot-status-dot" title="Online" />
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div className="chatbot-chips-bar">
                    {[
                      { emoji: '📊', label: 'Division Summary' },
                      { emoji: '📅', label: 'Weekly Progress' },
                      { emoji: '📈', label: '6-month trend' },
                      { emoji: '⏰', label: 'Overdue projects' },
                      { emoji: '💡', label: 'Give me ideas' },
                      { emoji: '🕐', label: 'Pending projects' },
                      { emoji: '🔧', label: 'Ongoing projects' },
                      { emoji: '✅', label: 'Completed projects' },
                      { emoji: '💰', label: 'Allocation report' },
                      { emoji: '🏛️', label: 'Ministry report' },
                      { emoji: '👥', label: 'Team report' },
                      { emoji: '🏗️', label: 'Work type breakdown' },
                      { emoji: '💵', label: 'Most expensive project' },
                      { emoji: '🏢', label: 'Department distribution' },
                    ].map(chip => (
                      <button
                        key={chip.label}
                        className="chatbot-chip"
                        onClick={() => sendChatMessage(chip.label)}
                      >
                        <span>{chip.emoji}</span> {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Messages */}
                  <div className="chatbot-messages">
                    {chatMessages.length === 0 ? (
                      <div className="chatbot-welcome">
                        <div className="chatbot-welcome-icon">
                          <MessageSquare size={32} />
                        </div>
                        <h3>Hello, Engineer! 👋</h3>
                        <p>
                          I'm your AI Assistant powered by live project data from the <strong>{currentDivision || 'your'}</strong> division.
                          Ask me for summaries, progress reports, recommendations, or use the quick chips above to get started!
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} className={`chatbot-msg-row ${msg.role === 'user' ? 'user-row' : ''}`}>
                          <div className={`chatbot-avatar ${msg.role === 'ai' ? 'ai-avatar' : 'user-avatar'}`}>
                            {msg.role === 'ai' ? '🤖' : '👤'}
                          </div>
                          <div>
                            <div
                              className={`chatbot-bubble ${msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'}`}
                              dangerouslySetInnerHTML={msg.role === 'ai'
                                ? { __html: formatBotMessage(msg.text) }
                                : undefined
                              }
                            >
                              {msg.role === 'user' ? msg.text : undefined}
                            </div>
                            <div className="chatbot-timestamp">{msg.time}</div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Typing indicator */}
                    {chatLoading && (
                      <div className="chatbot-msg-row">
                        <div className="chatbot-avatar ai-avatar">🤖</div>
                        <div className="chatbot-typing">
                          <span /><span /><span />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="chatbot-input-area">
                    <textarea
                      className="chatbot-input"
                      placeholder="Ask me about your projects, progress, ideas..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      rows={1}
                    />
                    <button
                      className="chatbot-send-btn"
                      onClick={() => sendChatMessage()}
                      disabled={!chatInput.trim() || chatLoading}
                      title="Send message"
                    >
                      <Send size={18} />
                    </button>
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
                  myRole="engineer"
                />
              </motion.section>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ─── Toast Notifications ─── */}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

export default EngineerDashboard;