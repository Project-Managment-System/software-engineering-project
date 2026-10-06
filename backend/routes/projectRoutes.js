const express = require('express');
const router = express.Router();
const {
    createProject,
    getAllProjects,
    getProjectsByDivision,
    getProjectByJobNo,
    updateProject,
    deleteProject,
    updateProjectStatus,
    undoProjectStatus, // Ensure this is exported from your controller
    undoEngineerReview
} = require('../controllers/projectController');
const { getProjectRisk, getRiskSummary } = require('../controllers/riskController');
const Project = require('../models/Project'); // Adjust path to your Project model
// 1. Admin: Create a new job
router.post('/add', createProject);

// 2. View all jobs (Admin/Engineer)
router.get('/all', getAllProjects);

// 3. Engineer: Get jobs for specific division
router.get('/division/:division', getProjectsByDivision);

// 3b. Get a single job by jobNo (includes drawingFileUrl, which list endpoints omit)
router.get('/job/:jobNo', getProjectByJobNo);

// 3c. Rule-based Risk Intelligence (COMPUTED, not ML) — see docs/RISK_INTELLIGENCE.md
// '/risk/summary' must be registered before '/risk/:jobNo' or Express would match
// "summary" as a jobNo on the dynamic route below.
router.get('/risk/summary', getRiskSummary);
router.get('/risk/:jobNo', getProjectRisk);

// 4. Update general job details
router.put('/update/:jobNo', updateProject); 

// 5. Update status (Approve/Reject)
router.patch('/status/:jobNo', updateProjectStatus);

// 6. Undo status (Reset to Pending)
router.patch('/undo/:jobNo', undoProjectStatus);

// 6b. Undo engineer review (Reset engineerReviewStatus to Pending)
router.patch('/undo-engineer-review/:jobNo', undoEngineerReview);

// 7. Admin: Delete a job
router.delete('/delete/:jobNo', deleteProject);

// In backend/routes/projectRoutes.js

// backend/routes/projectRoutes.js

// Ensure this path matches the axios call exactly
router.patch('/assign/:jobNo', async (req, res) => {
    try {
        const { jobNo } = req.params;
        const { assignee } = req.body;
        
        console.log("Updating job:", jobNo, "with assignee:", assignee); // Check your terminal!

        const updatedJob = await Project.findOneAndUpdate(
            { jobNo: jobNo }, 
            { assignee: assignee },
            { new: true }
        );

        if (!updatedJob) return res.status(404).json({ message: "Job not found" });
        res.json(updatedJob);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;