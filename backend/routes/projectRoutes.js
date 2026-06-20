const express = require('express');
const router = express.Router();
const { 
    createProject, 
    getAllProjects, 
    getProjectsByDivision, 
    updateProject, 
    deleteProject,
    updateProjectStatus,
    undoProjectStatus // Ensure this is exported from your controller
} = require('../controllers/projectController');
const Project = require('../models/Project'); // Adjust path to your Project model
// 1. Admin: Create a new job
router.post('/add', createProject);

// 2. View all jobs (Admin/Engineer)
router.get('/all', getAllProjects);

// 3. Engineer: Get jobs for specific division
router.get('/division/:division', getProjectsByDivision);

// 4. Update general job details
router.put('/update/:jobNo', updateProject); 

// 5. Update status (Approve/Reject)
router.patch('/status/:jobNo', updateProjectStatus);

// 6. Undo status (Reset to Pending)
router.patch('/undo/:jobNo', undoProjectStatus);

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