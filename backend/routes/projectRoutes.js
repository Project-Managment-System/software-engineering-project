const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, updateProject, deleteProject } = require('../controllers/projectController');

router.post('/add', createProject);
router.get('/all', getAllProjects);
router.put('/update/:id', updateProject); // NEW: Update route
router.delete('/delete/:id', deleteProject); // NEW: Delete route

module.exports = router;