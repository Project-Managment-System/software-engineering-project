import React, { useState, useMemo } from 'react';
import { Clock, MapPin, AlertTriangle } from 'lucide-react';
import { formatRoleLabel } from '../utils/jobTracking';

const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Shared across every dashboard's "Job Tracking" tab. `jobs` should already be scoped to
// whatever set that dashboard is allowed to see (division, assignee, etc.) — this component
// only picks a job from the list and renders its statusHistory timeline plus current location.
export default function JobTrackingTimeline({ jobs }) {
  const [selectedJobNo, setSelectedJobNo] = useState('');
  const selectedJob = useMemo(() => jobs.find(j => j.jobNo === selectedJobNo) || null, [jobs, selectedJobNo]);

  const history = selectedJob?.statusHistory || [];
  const currentLocation = history.length > 0
    ? history[history.length - 1]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="field-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Clock size={20} style={{ color: 'var(--accent-primary)' }} />
          <h3 className="recent-jobs-title" style={{ margin: 0 }}>Select a Job to Track</h3>
        </div>
        <div className="table-scroll-wrapper">
          <table className="project-table">
            <thead>
              <tr>
                <th>Serial No</th>
                <th>Estimation Number</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="placeholder-content" style={{ height: '120px', border: 'none' }}>
                      <AlertTriangle size={24} style={{ opacity: 0.35 }} />
                      <span>No jobs to track yet.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr
                    key={job.jobNo}
                    onClick={() => setSelectedJobNo(job.jobNo)}
                    className={job.jobNo === selectedJobNo ? 'row-selected' : ''}
                    style={{ cursor: 'pointer' }}
                    title="Click to view this job's tracking history"
                  >
                    <td>{index + 1}</td>
                    <td className="font-mono">{job.estimationNo || '—'}</td>
                    <td className="font-bold">{job.jobName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedJob && (
        <div className="field-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <MapPin size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="recent-jobs-title" style={{ margin: 0 }}>
              Tracking: {selectedJob.jobName} <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>({selectedJob.jobNo})</span>
            </h3>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-label)', marginBottom: '6px' }}>
              Current Location
            </div>
            {currentLocation ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="status-badge status-pending">{currentLocation.event}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {currentLocation.by ? `${currentLocation.by} (${formatRoleLabel(currentLocation.byRole)})` : formatRoleLabel(currentLocation.byRole)}
                  {currentLocation.at ? ` · ${formatDateTime(currentLocation.at)}` : ''}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                No tracking history recorded yet for this job — current status: <strong>{selectedJob.status || 'Pending'}</strong>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-label)', marginBottom: '10px' }}>
            Timeline
          </div>
          {history.length === 0 ? (
            <div className="placeholder-content" style={{ height: '100px', border: 'none' }}>
              <Clock size={22} style={{ opacity: 0.35 }} />
              <span>No tracking events recorded yet.</span>
            </div>
          ) : (
            <div className="jt-timeline">
              {history.map((entry, idx) => (
                <div key={idx} className="jt-timeline-row">
                  <div className="jt-timeline-dot" />
                  <div className="jt-timeline-body">
                    <div className="jt-timeline-event">{entry.event}</div>
                    <div className="jt-timeline-meta">
                      {entry.by ? `${entry.by} — ` : ''}{formatRoleLabel(entry.byRole)} · {formatDateTime(entry.at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
