// ─── Rule-Based Project Risk Intelligence — Configuration ─────────────────────
// Central place for every tunable number the risk engine uses. See
// docs/RISK_INTELLIGENCE.md for the full methodology write-up and worked example.
//
// This is a deterministic, formula-based scoring system — NOT a machine-learning
// model. Nothing here is trained, fitted, or inferred from historical outcomes;
// every number below is a hand-picked business rule.

// Relative importance of each factor when all five are available. If a factor
// can't be computed for a given project (required field missing/invalid), it is
// dropped and the remaining weights are re-normalized to sum back to 1 — see
// riskService.aggregateRiskScore().
const RISK_WEIGHTS = {
  daysPending: 0.30,
  staleness: 0.25,
  missingDrawing: 0.15,
  previousRejection: 0.15,
  allocationOutlier: 0.15,
};

// 0-100 score → risk level. Upper bound of each band is inclusive.
const RISK_THRESHOLDS = [
  { level: 'LOW', max: 24 },
  { level: 'MEDIUM', max: 49 },
  { level: 'HIGH', max: 74 },
  { level: 'CRITICAL', max: 100 },
];

// Days-pending factor: linear ramp from 0 days (score 0) to this cap (score 100).
const DAYS_PENDING_SATURATION = 180;

// Staleness factor: linear ramp from 0 days since last update (score 0) to this
// cap (score 100). Only applies to projects still in an active status — see
// riskService.computeStalenessFactor for why Completed/Rejected are excluded.
const STALENESS_SATURATION_DAYS = 60;

// Allocation-outlier factor: a project at or below its DS-division peer average
// scores 0. Score ramps linearly up to 100 at this multiple of the peer average.
const ALLOCATION_OUTLIER_SATURATION_RATIO = 3;

// Minimum number of projects that must share a DS division (including the
// project itself) before an allocation average is considered statistically
// meaningful enough to compare against. Below this, the factor is excluded.
const MIN_PEER_GROUP_SIZE = 3;

module.exports = {
  RISK_WEIGHTS,
  RISK_THRESHOLDS,
  DAYS_PENDING_SATURATION,
  STALENESS_SATURATION_DAYS,
  ALLOCATION_OUTLIER_SATURATION_RATIO,
  MIN_PEER_GROUP_SIZE,
};
