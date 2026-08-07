const Project = require('../models/Project');
const { computeProjectRisk, computePortfolioSummary, buildDsDivisionStats } = require('../services/riskService');

// Fields actually needed for risk scoring — same exclusion as list endpoints
// elsewhere in this controller layer (drawingFileUrl can be multiple MB/doc).
const RISK_PROJECTION = '-drawingFileUrl';

// Shared by the HTTP handler below and by the chatbot (chatbotController.js),
// so both surfaces score a single project identically — same peer-group query,
// same DS-division comparison, no duplicated logic to drift apart.
async function computeRiskWithPeers(project) {
  let peerProjects = [project];
  if (project.dsDivision) {
    peerProjects = await Project.find({ dsDivision: project.dsDivision })
      .select('allocation dsDivision')
      .lean();
  }
  const dsDivisionStats = buildDsDivisionStats(peerProjects);
  return computeProjectRisk(project, dsDivisionStats);
}

// 1. Single-project risk — GET /api/projects/risk/:jobNo
exports.getProjectRisk = async (req, res) => {
  try {
    const { jobNo } = req.params;
    const project = await Project.findOne({ jobNo }).select(RISK_PROJECTION).lean();
    if (!project) return res.status(404).json({ message: 'Job not found' });

    const risk = await computeRiskWithPeers(project);
    res.json({ projectId: project.jobNo, jobName: project.jobName, division: project.division, ...risk });
  } catch (error) {
    res.status(500).json({ message: 'Error computing project risk', error: error.message });
  }
};

// 2. Portfolio/division-wide risk summary — GET /api/projects/risk/summary
// Optional ?division= scopes to one engineering division (matches the
// division-scoped dashboards elsewhere in the app). One query fetches every
// project needed; scoring for all of them happens in a single in-memory pass —
// no per-project database round trip.
exports.getRiskSummary = async (req, res) => {
  try {
    const { division } = req.query;
    const filter = division ? { division } : {};
    const projects = await Project.find(filter).select(RISK_PROJECTION).lean();

    const summary = computePortfolioSummary(projects);
    res.json({ scope: division || 'all', ...summary });
  } catch (error) {
    res.status(500).json({ message: 'Error computing risk summary', error: error.message });
  }
};

exports.computeRiskWithPeers = computeRiskWithPeers;
