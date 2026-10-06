import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ShieldAlert, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import './RiskIntelligencePanel.css';

// Rule-based, deterministic project risk scoring — see backend/services/riskService.js
// and docs/RISK_INTELLIGENCE.md for the full methodology. This panel only renders
// what GET /api/projects/risk/summary actually returns; it never estimates or
// fabricates a score client-side.

const LEVEL_COLOR = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#e11d48',
};

const LEVEL_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function RiskIntelligencePanel({ division }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedJobNo, setExpandedJobNo] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = division
        ? `http://127.0.0.1:5000/api/projects/risk/summary?division=${encodeURIComponent(division)}`
        : 'http://127.0.0.1:5000/api/projects/risk/summary';
      const res = await axios.get(url);
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load risk data.');
    } finally {
      setLoading(false);
    }
  }, [division]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return (
    <div className="recent-jobs-card risk-panel">
      <div className="risk-panel-header">
        <h3 className="recent-jobs-title" style={{ margin: 0 }}>
          <ShieldAlert size={18} style={{ marginRight: 4 }} /> Risk Intelligence
        </h3>
        <button type="button" className="risk-refresh-btn" onClick={fetchSummary} disabled={loading} title="Recalculate">
          <RefreshCw size={14} className={loading ? 'risk-spin' : ''} />
        </button>
      </div>
      <p className="risk-panel-disclaimer">
        Rule-based risk assessment computed from available project data. It is not a machine-learning prediction.
      </p>

      {loading && !summary && <div className="risk-panel-empty">Calculating risk scores…</div>}
      {error && <div className="risk-panel-empty risk-panel-error">{error}</div>}

      {summary && (
        <>
          <div className="risk-kpi-row">
            <div className="risk-kpi-tile">
              <span className="risk-kpi-value">{summary.totalProjects}</span>
              <span className="risk-kpi-label">Projects Scored</span>
            </div>
            <div className="risk-kpi-tile">
              <span className="risk-kpi-value">{summary.averageScore ?? '—'}</span>
              <span className="risk-kpi-label">Avg. Risk Score</span>
            </div>
            <div className="risk-kpi-tile">
              <span className="risk-kpi-value" style={{ color: LEVEL_COLOR[summary.highestRiskProject?.level] || 'inherit' }}>
                {summary.highestRiskProject ? summary.highestRiskProject.score : '—'}
              </span>
              <span className="risk-kpi-label">
                {summary.highestRiskProject ? `Highest — ${summary.highestRiskProject.jobNo}` : 'Highest Risk'}
              </span>
            </div>
            <div className="risk-kpi-tile">
              <span className="risk-kpi-value" style={{ fontSize: '0.95rem' }}>{summary.topPortfolioRiskFactor || '—'}</span>
              <span className="risk-kpi-label">Top Contributing Factor</span>
            </div>
          </div>

          <div className="risk-distribution-row">
            {LEVEL_ORDER.map((level) => {
              const count = summary.riskDistribution?.[level] || 0;
              const pct = summary.scoredProjects ? (count / summary.scoredProjects) * 100 : 0;
              return (
                <div key={level} className="risk-distribution-item">
                  <div className="risk-distribution-bar-track">
                    <div className="risk-distribution-bar-fill" style={{ width: `${pct}%`, background: LEVEL_COLOR[level] }} />
                  </div>
                  <span className="risk-distribution-label">
                    <span className="risk-dot" style={{ background: LEVEL_COLOR[level] }} /> {level}: {count}
                  </span>
                </div>
              );
            })}
          </div>

          {summary.insufficientDataProjects > 0 && (
            <p className="risk-panel-note">
              {summary.insufficientDataProjects} project{summary.insufficientDataProjects !== 1 ? 's' : ''} could not be scored (insufficient data).
            </p>
          )}

          <h4 className="risk-subheading">Top At-Risk Projects</h4>
          {summary.topAtRiskProjects?.length ? (
            <div className="risk-project-list">
              {summary.topAtRiskProjects.map((p) => (
                <div key={p.jobNo} className="risk-project-row">
                  <button
                    type="button"
                    className="risk-project-row-main"
                    onClick={() => setExpandedJobNo(expandedJobNo === p.jobNo ? null : p.jobNo)}
                  >
                    <span className="risk-level-chip" style={{ background: LEVEL_COLOR[p.level] }}>{p.level}</span>
                    <span className="risk-project-name">[{p.jobNo}] {p.jobName}</span>
                    <span className="risk-project-division">{p.division}</span>
                    <span className="risk-project-score">{p.score}/100</span>
                    {expandedJobNo === p.jobNo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedJobNo === p.jobNo && (
                    <ul className="risk-factor-evidence-list">
                      {p.topFactors.map((f) => (
                        <li key={f.name}><strong>{f.name}:</strong> {f.evidence}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="risk-panel-empty">No projects available to score{division ? ` for ${division}` : ''}.</div>
          )}
        </>
      )}
    </div>
  );
}
