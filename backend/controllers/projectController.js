const Project = require('../models/Project');

// Create a New Construction Project
exports.createProject = async (req, res) => {
    try {
        const { projectName, location, budget, status, managerId } = req.body;

        const newProject = new Project({
            projectName,
            location,
            budget,
            status,
            manager: managerId // Link to the User ID we created earlier
        });

        await newProject.save();
        res.status(201).json({ message: "Project Created Successfully! 🏗️", project: newProject });
    } catch (error) {
        res.status(500).json({ message: "Error creating project", error: error.message });
    }
};

// Get All Projects
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('manager', 'name email');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects", error: error.message });
    }
};

// Update Project Status
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedProject = await Project.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ message: "Project Updated! ✅", project: updatedProject });
    } catch (error) {
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};

// Delete a Project
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await Project.findByIdAndDelete(id);
        res.json({ message: "Project Deleted Successfully! 🗑️" });
    } catch (error) {
        res.status(500).json({ message: "Delete Error", error: error.message });
    }
};