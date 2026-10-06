const {
  RISK_WEIGHTS,
  RISK_THRESHOLDS,
  DAYS_PENDING_SATURATION,
  STALENESS_SATURATION_DAYS,
  ALLOCATION_OUTLIER_SATURATION_RATIO,
  MIN_PEER_GROUP_SIZE,
} = require('../config/riskConfig');

const TERMINAL_STATUSES = new Set(['Completed', 'Rejected']);
const MS_PER_DAY = 86400000;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round1 = (n) => Math.round(n * 10) / 10;

const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

const daysBetween = (from, to) => Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);

// ─── Individual risk factors ───────────────────────────────────────────────
// Each returns { score: 0-100, evidence: string } or null when the factor
// cannot be reliably computed from the data actually present on the project.
// A null return means "exclude this factor," never "assume zero risk."

function computeDaysPendingFactor(project, now) {
  const requested = project.dateReq ? new Date(project.dateReq) : null;
  if (!isValidDate(requested)) return null;

  const isCompleted = project.status === 'Completed';
  const completedAt = isCompleted && project.updatedAt ? new Date(project.updatedAt) : null;
  const endpoint = isCompleted && isValidDate(completedAt) ? completedAt : now;
  if (endpoint.getTime() < requested.getTime()) return null; // corrupt/out-of-order dates

  const days = daysBetween(requested, endpoint);
  const score = clamp((days / DAYS_PENDING_SATURATION) * 100, 0, 100);
  const label = isCompleted ? `took ${days} day${days !== 1 ? 's' : ''} from request to completion`
    : `has been pending for ${days} day${days !== 1 ? 's' : ''} since request`;
  return { score: round1(score), evidence: `Project ${label}` };
}

// Terminal-status projects (Completed/Rejected) are excluded rather than scored:
// once resolved, "days since last touch" no longer reflects neglect — it reflects
// how long ago the outcome happened, which is a different thing entirely.
function computeStalenessFactor(project, now) {
  if (TERMINAL_STATUSES.has(project.status)) return null;

  const lastTouched = project.updatedAt ? new Date(project.updatedAt) : (project.createdAt ? new Date(project.createdAt) : null);
  if (!isValidDate(lastTouched)) return null;
  if (lastTouched.getTime() > now.getTime()) return null; // corrupt/out-of-order date

  const days = daysBetween(lastTouched, now);
  const score = clamp((days / STALENESS_SATURATION_DAYS) * 100, 0, 100);
  return { score: round1(score), evidence: `No update recorded for ${days} day${days !== 1 ? 's' : ''}` };
}

// drawingNeeded is null until the user makes that choice — null is genuinely
// unknown and must be excluded. false ("no drawing needed") is real, known
// data, not a missing value, so it resolves to zero risk rather than exclusion.
function computeMissingDrawingFactor(project) {
  if (project.drawingNeeded === null || project.drawingNeeded === undefined) return null;

  if (project.drawingNeeded === false) {
    return { score: 0, evidence: 'No drawing is required for this project' };
  }
  if (project.drawingReceived === true) {
    return { score: 0, evidence: 'Required drawing has already been received' };
  }
  return { score: 100, evidence: 'Drawing is required for this project but has not been received yet' };
}

// Rejection at any real review gate the schema tracks. Every one of these
// fields has a schema default, so this factor is always computable.
function computePreviousRejectionFactor(project) {
  const rejectedStages = [];
  if (project.status === 'Rejected') rejectedStages.push('job status');
  if (project.drawingDaStatus === 'Rejected') rejectedStages.push('drawing request (DA review)');
  if (project.daReviewStatus === 'Rejected') rejectedStages.push('estimate review (DA)');
  if (project.engineerReviewStatus === 'Rejected') rejectedStages.push('estimate review (Engineer)');

  if (rejectedStages.length === 0) {
    return { score: 0, evidence: 'No rejection recorded at any review stage' };
  }
  return { score: 100, evidence: `Previously rejected at: ${rejectedStages.join(', ')}` };
}

// Compares allocation against the average of other projects sharing the same
// DS division. Requires a non-empty dsDivision AND a big enough peer group —
// an "average" of one or two projects isn't a meaningful baseline.
function computeAllocationOutlierFactor(project, peerAverage, peerGroupSize) {
  const allocation = parseFloat(project.allocation);
  if (!Number.isFinite(allocation) || allocation < 0) return null;
  if (!project.dsDivision) return null;
  if (peerGroupSize < MIN_PEER_GROUP_SIZE || !Number.isFinite(peerAverage) || peerAverage <= 0) return null;

  const ratio = allocation / peerAverage;
  if (ratio <= 1) {
    return { score: 0, evidence: `Allocation is at or below the ${project.dsDivision} DS division average` };
  }
  const score = clamp(((ratio - 1) / (ALLOCATION_OUTLIER_SATURATION_RATIO - 1)) * 100, 0, 100);
  return {
    score: round1(score),
    evidence: `Allocation is ${round1(ratio)}x the ${project.dsDivision} DS division average (of ${peerGroupSize} projects)`,
  };
}

// ─── Peer-group averages (for the allocation-outlier factor) ──────────────
// Computed once per batch of projects, not once per project, so the summary
// endpoint doesn't run an O(n^2) scan over the portfolio.
function buildDsDivisionStats(projects) {
  const groups = new Map();
  projects.forEach((p) => {
    if (!p.dsDivision) return;
    const alloc = parseFloat(p.allocation);
    if (!Number.isFinite(alloc) || alloc < 0) return;
    if (!groups.has(p.dsDivision)) groups.set(p.dsDivision, { sum: 0, count: 0 });
    const g = groups.get(p.dsDivision);
    g.sum += alloc;
    g.count += 1;
  });
  const stats = new Map();
  groups.forEach((g, key) => stats.set(key, { average: g.sum / g.count, count: g.count }));
  return stats;
}

function classifyLevel(score) {
  const band = RISK_THRESHOLDS.find((t) => score <= t.max);
  return band ? band.level : RISK_THRESHOLDS[RISK_THRESHOLDS.length - 1].level;
}

// ─── Aggregation ────────────────────────────────────────────────────────────
// dsDivisionStats: Map built by buildDsDivisionStats(), scoped to whatever
// project population the caller wants peer comparisons drawn from.
function computeProjectRisk(project, dsDivisionStats, now = new Date()) {
  const peer = project.dsDivision ? dsDivisionStats.get(project.dsDivision) : null;

  const raw = {
    daysPending: computeDaysPendingFactor(project, now),
    staleness: computeStalenessFactor(project, now),
    missingDrawing: computeMissingDrawingFactor(project),
    previousRejection: computePreviousRejectionFactor(project),
    allocationOutlier: computeAllocationOutlierFactor(project, peer ? peer.average : null, peer ? peer.count : 0),
  };

  const FACTOR_LABELS = {
    daysPending: 'Days Pending',
    staleness: 'Staleness',
    missingDrawing: 'Missing Drawing',
    previousRejection: 'Previous Review Rejection',
    allocationOutlier: 'Allocation vs. DS Division Average',
  };

  const available = Object.entries(raw).filter(([, v]) => v !== null);
  const totalPossibleFactors = Object.keys(raw).length;

  const limitations = Object.entries(raw)
    .filter(([, v]) => v === null)
    .map(([key]) => `${FACTOR_LABELS[key]} could not be calculated — required data is unavailable for this project`);

  if (available.length === 0) {
    return {
      status: 'INSUFFICIENT_DATA',
      score: null,
      level: null,
      classification: 'COMPUTED',
      method: 'RULE_BASED',
      factors: [],
      availableFactors: 0,
      totalPossibleFactors,
      limitations: ['No risk factor could be calculated from the available project data'],
      generatedAt: now.toISOString(),
    };
  }

  const weightSum = available.reduce((acc, [key]) => acc + RISK_WEIGHTS[key], 0);

  const factors = available.map(([key, v]) => {
    const normalizedWeight = RISK_WEIGHTS[key] / weightSum;
    return {
      name: FACTOR_LABELS[key],
      score: v.score,
      weight: round1(normalizedWeight * 100) / 100,
      contribution: round1(v.score * normalizedWeight),
      evidence: v.evidence,
    };
  }).sort((a, b) => b.contribution - a.contribution);

  const score = clamp(round1(factors.reduce((acc, f) => acc + f.contribution, 0)), 0, 100);

  return {
    status: 'OK',
    score,
    level: classifyLevel(score),
    classification: 'COMPUTED',
    method: 'RULE_BASED',
    factors,
    availableFactors: available.length,
    totalPossibleFactors,
    limitations,
    generatedAt: now.toISOString(),
  };
}

// ─── Portfolio-wide summary ─────────────────────────────────────────────────
function computePortfolioSummary(projects, now = new Date()) {
  const dsDivisionStats = buildDsDivisionStats(projects);

  const results = projects.map((p) => ({ project: p, risk: computeProjectRisk(p, dsDivisionStats, now) }));
  const scored = results.filter((r) => r.risk.status === 'OK');
  const insufficient = results.length - scored.length;

  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  scored.forEach((r) => { counts[r.risk.level] += 1; });

  const averageScore = scored.length
    ? round1(scored.reduce((acc, r) => acc + r.risk.score, 0) / scored.length)
    : null;

  const highestRisk = scored.length
    ? scored.reduce((max, r) => (r.risk.score > max.risk.score ? r : max))
    : null;

  const factorContribution = new Map();
  scored.forEach((r) => {
    r.risk.factors.forEach((f) => {
      factorContribution.set(f.name, (factorContribution.get(f.name) || 0) + f.contribution);
    });
  });
  let topFactor = null;
  factorContribution.forEach((total, name) => {
    if (!topFactor || total > topFactor.total) topFactor = { name, total };
  });

  return {
    classification: 'COMPUTED',
    method: 'RULE_BASED',
    totalProjects: projects.length,
    scoredProjects: scored.length,
    insufficientDataProjects: insufficient,
    riskDistribution: counts,
    averageScore,
    highestRiskProject: highestRisk ? {
      jobNo: highestRisk.project.jobNo,
      jobName: highestRisk.project.jobName,
      division: highestRisk.project.division,
      score: highestRisk.risk.score,
      level: highestRisk.risk.level,
    } : null,
    topPortfolioRiskFactor: topFactor ? topFactor.name : null,
    topAtRiskProjects: scored
      .slice()
      .sort((a, b) => b.risk.score - a.risk.score)
      .slice(0, 10)
      .map((r) => ({
        jobNo: r.project.jobNo,
        jobName: r.project.jobName,
        division: r.project.division,
        status: r.project.status,
        score: r.risk.score,
        level: r.risk.level,
        topFactors: r.risk.factors.slice(0, 3).map((f) => ({ name: f.name, evidence: f.evidence })),
      })),
    generatedAt: now.toISOString(),
  };
}

module.exports = {
  computeDaysPendingFactor,
  computeStalenessFactor,
  computeMissingDrawingFactor,
  computePreviousRejectionFactor,
  computeAllocationOutlierFactor,
  buildDsDivisionStats,
  classifyLevel,
  computeProjectRisk,
  computePortfolioSummary,
};
