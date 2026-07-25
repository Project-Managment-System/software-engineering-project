import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase, Eye, CheckCircle, Clock, AlertTriangle, Sun, Moon, ArrowLeft, HardHat, User as UserIcon, PenTool
} from 'lucide-react';
import '../shared/BranchDashboard.css';

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

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '—';
const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '—';

const JOB_FIELDS = [
  { label: 'Job No', key: 'jobNo' },
  { label: 'Estimation No', key: 'estimationNo' },
  { label: 'Division', key: 'division' },
  { label: 'Ministry', key: 'ministry' },
  { label: 'Department', key: 'department' },
  { label: 'Institute', key: 'institute' },
  { label: 'Work Type', key: 'work', format: (v) => v === 'R' ? 'Repair' : 'New' },
  { label: 'Allocation', key: 'allocation' },
  { label: 'Date Requested', key: 'dateReq', format: formatDate },
  { label: 'Reference', key: 'ref' },
  { label: 'Submitted On', key: 'submitDate', format: formatDate },
];

const DRAWING_TIMELINE_FIELDS = [
  { label: 'Drawing Requested', key: 'drawingRequestedAt', format: formatDateTime },
  { label: 'Forwarded to Design Director', key: 'daDrawingForwardedAt', format: formatDateTime },
  { label: 'Assigned to Engineer', key: 'assignedDesignEngineerAt', format: formatDateTime },
  { label: 'Drawing Attached by Engineer', key: 'drawingAttachedAt', format: formatDateTime },
  { label: 'Approved by Director', key: 'directorApprovedAt', format: formatDateTime },
];

const DetailField = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
      {value === '' || value === undefined || value === null ? '—' : String(value)}
    </div>
  </div>
);

const PersonCard = ({ icon: Icon, roleLabel, person, fallbackName }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-base)', background: 'var(--bg-subtle)' }}>
    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
      <Icon size={18} />
    </div>
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-label)', marginBottom: '3px' }}>
        {roleLabel}
      </div>
      {person ? (
        <>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{person.fullName}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{person.email || '—'}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{person.phoneNo || '—'}</div>
        </>
      ) : (
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: fallbackName ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: fallbackName ? 'normal' : 'italic' }}>
          {fallbackName || 'Unassigned'}
        </div>
      )}
    </div>
  </div>
);

const JobDetailsPage = () => {
  const { jobNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedJob = location.state?.job;
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [accentTheme] = useState(() => localStorage.getItem('accentTheme') || 'violet');
  const [job, setJob] = useState(preloadedJob || null);
  const [divisionStaff, setDivisionStaff] = useState([]);
  const [loading, setLoading] = useState(!preloadedJob);
  const [error, setError] = useState(null);

  // Full job data is handed off via navigation state from the dashboard row click,
  // so this only hits /api/projects/all (which includes every drawing's base64 file
  // data and is slow) on a direct page load/refresh where that state isn't available.
  useEffect(() => {
    if (preloadedJob) return;
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/projects/all');
        const found = (res.data || []).find(p => p.jobNo === jobNo);
        setJob(found || null);
        if (!found) setError('Job not found.');
      } catch (err) {
        console.error('Error loading job details:', err);
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobNo]);

  useEffect(() => {
    if (!job?.division) return;
    const fetchStaff = async () => {
      try {
        const staffRes = await axios.get(`http://127.0.0.1:5000/api/users/division/${encodeURIComponent(job.division)}`);
        setDivisionStaff(staffRes.data || []);
      } catch (staffErr) {
        console.error('Error loading division staff:', staffErr);
      }
    };
    fetchStaff();
  }, [job?.division]);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  const isApproved = job?.drawingWorkflowStatus === 'Completed';
  const statusLabel = {
    PendingDA: 'Pending Divisional Assistant Review',
    PendingDirectorAssignment: 'Awaiting Engineer Assignment',
    PendingEngineerDesign: 'Awaiting Drawing Attachment',
    PendingDirectorDesign: 'Awaiting Director Approval',
    Completed: 'Drawing Sent to User',
  }[job?.drawingWorkflowStatus] || 'Not Requested';
  const divisionEngineer = divisionStaff.find(u => u.role === 'engineer');
  const assignedUser = job?.assignee
    ? divisionStaff.find(u => u.role === 'user' && u.fullName === job.assignee)
    : null;

  return (
    <div id="cems-user-dashboard" className={`${isDark ? 'dark-mode' : 'light-mode'} theme-${accentTheme}`}>
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Briefcase size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Job Details</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full details for this job's drawing approval</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cancel-btn" onClick={toggleDarkMode} title="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="cancel-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {loading && (
          <div className="placeholder-content" style={{ height: '200px' }}>
            <Clock size={28} style={{ opacity: 0.4 }} />
            <span>Loading job details...</span>
          </div>
        )}

        {!loading && error && (
          <div className="placeholder-content" style={{ height: '200px' }}>
            <AlertTriangle size={28} style={{ opacity: 0.4 }} />
            <span>{error}</span>
          </div>
        )}

        {!loading && job && (
          <>
            <div className="recent-jobs-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 className="recent-jobs-title" style={{ margin: 0 }}>{job.jobName}</h3>
                <span className={`status-badge ${isApproved ? 'status-approved' : 'status-pending'}`}>
                  {isApproved ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {statusLabel}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
                {JOB_FIELDS.map(f => (
                  <DetailField key={f.key} label={f.label} value={f.format ? f.format(job[f.key]) : job[f.key]} />
                ))}
              </div>
            </div>

            <div className="recent-jobs-card">
              <h3 className="recent-jobs-title">Assigned Personnel</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <PersonCard icon={HardHat} roleLabel="Division Engineer" person={divisionEngineer} />
                <PersonCard icon={UserIcon} roleLabel="Assigned User (Field Visit)" person={assignedUser} fallbackName={job.assignee} />
                <PersonCard icon={PenTool} roleLabel="Assigned Design Engineer" person={null} fallbackName={job.assignedDesignEngineerName} />
              </div>
            </div>

            <div className="recent-jobs-card">
              <h3 className="recent-jobs-title">Drawing Approval Timeline</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: job.drawingFileUrl ? '20px' : 0 }}>
                {DRAWING_TIMELINE_FIELDS.map(f => (
                  <DetailField key={f.key} label={f.label} value={f.format(job[f.key])} />
                ))}
              </div>
              {job.drawingFileUrl && (
                <button
                  type="button"
                  onClick={() => openAttachment(job.drawingFileUrl)}
                  className="save-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} /> View Attached Drawing
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobDetailsPage;
