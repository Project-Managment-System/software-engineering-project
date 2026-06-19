const Project = require('../models/Project');

// Helper to generate unique Job Number
const generateJobNo = async () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const jobNo = `JB-${randomNum}`;
    const existing = await Project.findOne({ jobNo });
    return existing ? generateJobNo() : jobNo; 
};

// 1. Create a New Project (Admin)
exports.createProject = async (req, res) => {
    try {
        const { jobName, ministry, department, division, allocation, dateReq, ref, institute } = req.body;
        const jobNo = await generateJobNo();

        const newProject = new Project({
            jobNo, jobName, ministry, department, division, allocation, dateReq, ref, institute,
            status: 'Pending'
        });

        await newProject.save();
        res.status(201).json({ message: "Job Created Successfully! 🏗️", project: newProject });
    } catch (error) {
        res.status(500).json({ message: "Error creating job", error: error.message });
    }
};

// 2. Get All Projects (Admin Dashboard)
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects", error: error.message });
    }
};

// 3. Get Projects by Division (Engineer Dashboard)
exports.getProjectsByDivision = async (req, res) => {
    try {
        const { division } = req.params;
        // Using strict match as the division name is passed from the logged-in engineer's session
        const projects = await Project.find({ division: division }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching division projects", error: error.message });
    }
};

// 4. Update Project Status (Approve/Reject)
exports.updateProjectStatus = async (req, res) => {
    try {
        const { jobNo } = req.params;
        const { status } = req.body; 
        
        const updatedProject = await Project.findOneAndUpdate(
            { jobNo }, 
            { status }, 
            { new: true }
        );
        
        if (!updatedProject) return res.status(404).json({ message: "Job not found" });
        res.json({ message: `Status updated to ${status}! ✅`, project: updatedProject });
    } catch (error) {
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};

// 5. Undo Project Status (Reset to Pending)
exports.undoProjectStatus = async (req, res) => {
    try {
        const { jobNo } = req.params;
        const updatedProject = await Project.findOneAndUpdate(
            { jobNo }, 
            { status: 'Pending' }, 
            { new: true }
        );
        if (!updatedProject) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Status reset to Pending! 🔄", project: updatedProject });
    } catch (error) {
        res.status(500).json({ message: "Undo Error", error: error.message });
    }
};

// 6. Update Project Details (General Edit)
exports.updateProject = async (req, res) => {
    try {
        const { jobNo } = req.params;
        const updatedProject = await Project.findOneAndUpdate({ jobNo }, req.body, { new: true });
        if (!updatedProject) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job Updated! ✅", project: updatedProject });
    } catch (error) {
        res.status(500).json({ message: "Update Error", error: error.message });
    }
};

// 7. Delete a Project
exports.deleteProject = async (req, res) => {
    try {
        const { jobNo } = req.params;
        const deleted = await Project.findOneAndDelete({ jobNo });
        if (!deleted) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job Deleted Successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Delete Error", error: error.message });
    }
};