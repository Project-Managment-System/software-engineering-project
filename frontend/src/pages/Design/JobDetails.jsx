import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Briefcase, Eye, CheckCircle, Clock, AlertTriangle, ArrowLeft, HardHat, User as UserIcon, PenTool, Download
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

// This page is reached from several different dashboards (division engineer, divisional
// assistant, and every branch/design engineer or director), each of which now persists its
// own independent theme under its own localStorage key. Since this page has no toggle of its
// own, it just inherits whichever dashboard the user is currently in.
const getScopedThemeKeys = () => {
  const role = localStorage.getItem('role');
  const branch = localStorage.getItem('userBranch');
  if (role === 'engineer') return { theme: 'engineer-dashboard-theme', accent: 'engineer-dashboard-accentTheme' };
  if (role === 'division_assistant') return { theme: 'divisional-assistant-dashboard-theme', accent: 'divisional-assistant-dashboard-accentTheme' };
  if (role === 'branch_engineer' && branch) return { theme: `${branch}-engineer-dashboard-theme`, accent: `${branch}-engineer-dashboard-accentTheme` };
  if (role === 'branch_director' && branch) return { theme: `${branch}-director-dashboard-theme`, accent: `${branch}-director-dashboard-accentTheme` };
  return { theme: 'theme', accent: 'accentTheme' };
};

const JobDetailsPage = () => {
  const { jobNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedJob = location.state?.job;
  const [themeKeys] = useState(getScopedThemeKeys);
  const [isDark] = useState(() => localStorage.getItem(themeKeys.theme) === 'dark');
  const [accentTheme] = useState(() => localStorage.getItem(themeKeys.accent) || 'violet');
  const [job, setJob] = useState(preloadedJob || null);
  const [divisionStaff, setDivisionStaff] = useState([]);
  const [loading, setLoading] = useState(!preloadedJob);
  const [error, setError] = useState(null);

  // Full job data (minus the attachment) is handed off via navigation state from the
  // dashboard row click, so this renders instantly. List endpoints omit drawingFileUrl
  // for performance, so we always fetch the single job below — a small, fast request
  // that hydrates the attachment field in the background without blocking the initial
  // render, and is also the (fast) fallback source on a direct page load/refresh.
  useEffect(() => {
    const fetchJob = async () => {
      if (!preloadedJob) setLoading(true);
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/projects/job/${jobNo}`);
        if (res.data) setJob(res.data);
        else if (!preloadedJob) { setJob(null); setError('Job not found.'); }
      } catch (err) {
        console.error('Error loading job details:', err);
        // Keep showing the preloaded job (if any) rather than blanking it on a transient error
        if (!preloadedJob) setError('Failed to load job details.');
      } finally {
        if (!preloadedJob) setLoading(false);
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

  const handleDownloadPdf = () => {
    if (!job) return;
    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(15);
    doc.text(job.jobName || 'Job Details', 14, 16);
    doc.setFontSize(9);
    doc.text(`Status: ${statusLabel}`, 14, 23);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);

    autoTable(doc, {
      head: [['Job Information', '']],
      body: JOB_FIELDS.map(f => [f.label, f.format ? String(f.format(job[f.key])) : (job[f.key] ?? '—')]),
      startY: 34,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8, cellPadding: 3, font: 'Helvetica' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    });

    autoTable(doc, {
      head: [['Assigned Personnel', 'Name']],
      body: [
        ['Division Engineer', divisionEngineer?.fullName || '—'],
        ['Assigned User (Field Visit)', assignedUser?.fullName || job.assignee || '—'],
        ['Assigned Design Engineer', job.assignedDesignEngineerName || '—'],
      ],
      startY: doc.lastAutoTable.finalY + 8,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8, cellPadding: 3, font: 'Helvetica' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    });

    autoTable(doc, {
      head: [['Drawing Approval Timeline', '']],
      body: DRAWING_TIMELINE_FIELDS.map(f => [f.label, f.format(job[f.key])]),
      startY: doc.lastAutoTable.finalY + 8,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8, cellPadding: 3, font: 'Helvetica' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    });

    if (job.finalEstimateCost != null) {
      autoTable(doc, {
        head: [['Final Estimate', '']],
        body: [
          ['Estimate Cost', `Rs. ${job.finalEstimateCost}`],
          ['Submitted On', formatDateTime(job.finalEstimateSubmittedAt)],
          ['Engineer Review Status', job.engineerReviewStatus || 'Pending'],
          ['Engineer Reviewed On', formatDateTime(job.engineerReviewedAt)],
        ],
        startY: doc.lastAutoTable.finalY + 8,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 8, cellPadding: 3, font: 'Helvetica' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      });
    }

    doc.save(`${job.jobNo || 'job'}_details.pdf`);
  };

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
            {job && (
              <button className="save-btn" onClick={handleDownloadPdf}>
                <Download size={14} /> Download PDF
              </button>
            )}
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
