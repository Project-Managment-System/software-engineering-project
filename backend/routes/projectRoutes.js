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

module.exports = router;