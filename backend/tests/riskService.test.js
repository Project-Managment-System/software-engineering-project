// Tests run entirely against plain objects — no MongoDB connection needed,
// because the risk engine (backend/services/riskService.js) is pure functions
// over project-shaped data. This intentionally keeps the whole suite runnable
// offline with zero test infrastructure beyond Jest.
const {
  classifyLevel,
  buildDsDivisionStats,
  computeProjectRisk,
  computePortfolioSummary,
} = require('../services/riskService');

const NOW = new Date('2026-08-07T00:00:00.000Z');
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString();

const baseProject = (overrides = {}) => ({
  jobNo: 'JB-0001',
  jobName: 'Test Job',
  division: 'Anuradhapura-East',
  dsDivision: '',
  status: 'Pending',
  allocation: '100000',
  dateReq: daysAgo(5),
  createdAt: daysAgo(5),
  updatedAt: daysAgo(5),
  drawingNeeded: false,
  drawingReceived: false,
  drawingDaStatus: 'Pending',
  daReviewStatus: 'Pending',
  engineerReviewStatus: 'Pending',
  ...overrides,
});

// A 3-member DS division peer group all allocated at 100000, so ratio == 1
// (score 0) unless a test overrides a member's allocation.
const peerStats = (avg = 100000, count = 3) => new Map([['Div A', { average: avg, count }]]);

describe('classifyLevel', () => {
  test('boundary values map to the documented bands', () => {
    expect(classifyLevel(0)).toBe('LOW');
    expect(classifyLevel(24)).toBe('LOW');
    expect(classifyLevel(25)).toBe('MEDIUM');
    expect(classifyLevel(49)).toBe('MEDIUM');
    expect(classifyLevel(50)).toBe('HIGH');
    expect(classifyLevel(74)).toBe('HIGH');
    expect(classifyLevel(75)).toBe('CRITICAL');
    expect(classifyLevel(100)).toBe('CRITICAL');
  });
});

describe('computeProjectRisk — scenario 1: low-risk project', () => {
  test('recently requested, recently updated, no red flags -> LOW', () => {
    const project = baseProject({
      dsDivision: 'Div A',
      dateReq: daysAgo(5),
      updatedAt: daysAgo(2),
      drawingNeeded: false,
    });
    const risk = computeProjectRisk(project, peerStats());
    expect(risk.status).toBe('OK');
    expect(risk.classification).toBe('COMPUTED');
    expect(risk.method).toBe('RULE_BASED');
    expect(risk.availableFactors).toBe(5);
    expect(risk.level).toBe('LOW');
    expect(risk.score).toBeLessThanOrEqual(24);
  });
});

describe('computeProjectRisk — scenario 2: medium-risk project', () => {
  test('moderate pending + staleness -> MEDIUM', () => {
    const project = baseProject({
      dsDivision: 'Div A',
      status: 'Ongoing',
      dateReq: daysAgo(90),
      updatedAt: daysAgo(30),
      drawingNeeded: false,
    });
    const risk = computeProjectRisk(project, peerStats());
    expect(risk.level).toBe('MEDIUM');
    expect(risk.score).toBeGreaterThanOrEqual(25);
    expect(risk.score).toBeLessThanOrEqual(49);
  });
});

describe('computeProjectRisk — scenario 3: high-risk project', () => {
  test('long pending + stale + missing drawing -> HIGH', () => {
    const project = baseProject({
      dsDivision: 'Div A',
      status: 'Ongoing',
      dateReq: daysAgo(150),
      updatedAt: daysAgo(45),
      drawingNeeded: true,
      drawingReceived: false,
    });
    const risk = computeProjectRisk(project, peerStats());
    expect(risk.level).toBe('HIGH');
    expect(risk.score).toBeGreaterThanOrEqual(50);
    expect(risk.score).toBeLessThanOrEqual(74);
  });
});

describe('computeProjectRisk — scenario 4: critical-risk project', () => {
  test('every factor maxed out -> CRITICAL (100)', () => {
    const project = baseProject({
      dsDivision: 'Div A',
      status: 'Ongoing', // non-terminal so staleness still applies
      dateReq: daysAgo(220), // beyond the 180-day saturation cap
      updatedAt: daysAgo(90), // beyond the 60-day saturation cap
      drawingNeeded: true,
      drawingReceived: false,
      engineerReviewStatus: 'Rejected', // rejection at a real review gate
      allocation: '400000', // 4x the 100000 peer average, beyond the 3x cap
    });
    const risk = computeProjectRisk(project, peerStats(100000, 3));
    expect(risk.level).toBe('CRITICAL');
    expect(risk.score).toBe(100);
    expect(risk.factors.find((f) => f.name === 'Previous Review Rejection').evidence)
      .toMatch(/estimate review \(Engineer\)/);
  });
});

describe('computeProjectRisk — scenario 5: missing optional factor', () => {
  test('no dsDivision set -> allocation factor excluded, weights renormalize', () => {
    const project = baseProject({ dsDivision: '', allocation: '999999999' });
    const risk = computeProjectRisk(project, new Map());
    expect(risk.status).toBe('OK');
    expect(risk.availableFactors).toBe(4);
    expect(risk.totalPossibleFactors).toBe(5);
    expect(risk.limitations.some((l) => l.includes('Allocation vs. DS Division Average'))).toBe(true);
    expect(risk.factors.find((f) => f.name === 'Allocation vs. DS Division Average')).toBeUndefined();
    const weightSum = risk.factors.reduce((acc, f) => acc + f.weight, 0);
    expect(weightSum).toBeCloseTo(1, 1);
  });
});

describe('computeProjectRisk — scenario 6: missing dates', () => {
  test('dateReq/updatedAt/createdAt all absent -> those factors excluded, no crash', () => {
    const project = baseProject({
      dsDivision: 'Div A',
      dateReq: null,
      updatedAt: null,
      createdAt: null,
    });
    const risk = computeProjectRisk(project, peerStats());
    expect(risk.status).toBe('OK');
    expect(risk.factors.find((f) => f.name === 'Days Pending')).toBeUndefined();
    expect(risk.factors.find((f) => f.name === 'Staleness')).toBeUndefined();
    expect(risk.limitations.some((l) => l.includes('Days Pending'))).toBe(true);
    expect(risk.limitations.some((l) => l.includes('Staleness'))).toBe(true);
  });
});

describe('computeProjectRisk — scenario 7: invalid data', () => {
  test('negative allocation and unparseable date do not crash and are excluded', () => {
    const project = baseProject({
      dsDivision: 'Div A',
      allocation: '-500',
      dateReq: 'not-a-real-date',
    });
    expect(() => computeProjectRisk(project, peerStats())).not.toThrow();
    const risk = computeProjectRisk(project, peerStats());
    expect(risk.factors.find((f) => f.name === 'Days Pending')).toBeUndefined();
    expect(risk.factors.find((f) => f.name === 'Allocation vs. DS Division Average')).toBeUndefined();
  });
});

describe('computePortfolioSummary — scenario 8: no projects', () => {
  test('empty portfolio returns a valid zeroed summary, not an error', () => {
    const summary = computePortfolioSummary([]);
    expect(summary.totalProjects).toBe(0);
    expect(summary.scoredProjects).toBe(0);
    expect(summary.riskDistribution).toEqual({ LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });
    expect(summary.averageScore).toBeNull();
    expect(summary.highestRiskProject).toBeNull();
    expect(summary.topAtRiskProjects).toEqual([]);
  });
});

describe('computeProjectRisk — scenario 9: DS division with insufficient comparison data', () => {
  test('peer group smaller than MIN_PEER_GROUP_SIZE excludes the allocation factor', () => {
    const project = baseProject({ dsDivision: 'Lonely Division', allocation: '500000' });
    // Only 2 projects share this DS division (below the configured minimum of 3).
    const projects = [
      project,
      baseProject({ jobNo: 'JB-0002', dsDivision: 'Lonely Division', allocation: '100000' }),
    ];
    const stats = buildDsDivisionStats(projects);
    const risk = computeProjectRisk(project, stats);
    expect(risk.factors.find((f) => f.name === 'Allocation vs. DS Division Average')).toBeUndefined();
    expect(risk.limitations.some((l) => l.includes('Allocation vs. DS Division Average'))).toBe(true);
  });

  test('peer group at or above the minimum does include the factor', () => {
    const project = baseProject({ dsDivision: 'Busy Division', allocation: '500000' });
    const projects = [
      project,
      baseProject({ jobNo: 'JB-0002', dsDivision: 'Busy Division', allocation: '100000' }),
      baseProject({ jobNo: 'JB-0003', dsDivision: 'Busy Division', allocation: '100000' }),
    ];
    const stats = buildDsDivisionStats(projects);
    const risk = computeProjectRisk(project, stats);
    expect(risk.factors.find((f) => f.name === 'Allocation vs. DS Division Average')).toBeDefined();
  });
});

// Scenario 10 (authorization/access control) is intentionally NOT tested here.
// The codebase currently has no JWT-verification/authorization middleware on
// ANY /api/projects route (confirmed by inspection — authMiddleware.js only
// exports a cache-control helper, and no route wires req.user/role checks).
// The new risk endpoints match that existing (unauthenticated) convention for
// consistency, so there is no authorization behavior to assert yet. Faking a
// passing auth test here would misrepresent the system's actual security
// posture — see docs/RISK_INTELLIGENCE.md "Known limitations".
test.todo('authorization/access control — blocked on: no auth middleware exists anywhere in this backend yet');

describe('computePortfolioSummary — realistic mixed portfolio', () => {
  test('aggregates counts, average, highest-risk project and top factor correctly', () => {
    const projects = [
      baseProject({ jobNo: 'LOW-1', dsDivision: 'Div A', dateReq: daysAgo(3), updatedAt: daysAgo(1) }),
      baseProject({
        jobNo: 'CRIT-1', dsDivision: 'Div A', status: 'Ongoing', dateReq: daysAgo(220), updatedAt: daysAgo(90),
        drawingNeeded: true, drawingReceived: false, engineerReviewStatus: 'Rejected', allocation: '400000',
      }),
      baseProject({ jobNo: 'LOW-2', dsDivision: 'Div A', dateReq: daysAgo(2), updatedAt: daysAgo(1) }),
    ];
    const summary = computePortfolioSummary(projects, NOW);
    expect(summary.totalProjects).toBe(3);
    expect(summary.scoredProjects).toBe(3);
    expect(summary.riskDistribution.CRITICAL).toBe(1);
    expect(summary.riskDistribution.LOW).toBe(2);
    expect(summary.highestRiskProject.jobNo).toBe('CRIT-1');
    expect(summary.topAtRiskProjects[0].jobNo).toBe('CRIT-1');
  });
});
