const Project = require('../models/Project');

// Helper to generate unique Job Number
const generateJobNo = async () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const jobNo = `JB-${randomNum}`;
    const existing = await Project.findOne({ jobNo });
    return existing ? generateJobNo() : jobNo;
};

// ── Estimation No. code tables (per official Project Detail code list) ──
// Format: YY-DIVCODE-DEPTCODE-WORK-SERIAL (e.g. 26-ANU E-610-N-01)

// Ministry-level codes — used only as a fallback when the specific department has no code below
const MINISTRY_CODES = {
    'CHIEF MINISTRY': '610',
    'MINISTRY OF AGRICULTURE': '620',
    'MINISTRY OF CO-OPERATIVE': '640',
    'OTHER': '660',
};

// Department-level codes — the primary lookup, keyed to the exact department option strings
const DEPARTMENT_CODES = {
    // CHIEF MINISTRY
    'DEPARTMENT OF EDUCATION': '612',
    'DEPARTMENT OF CULTURAL AFFAIR': '613',
    'DEPARTMENT OF SPORTS-NCP': '643',
    // MINISTRY OF AGRICULTURE
    'DEPARTMENT OF AGRICULTURE': '621',
    'DEPARTMENT OF ANIMAL PRODUCTION & HEALTH': '622',
    'DEPARTMENT OF IRRIGATION DEPARTMENT': '651',
    // MINISTRY OF HEALTH
    'DEPARTMENT OF HEALTH': '631',
    'DEPARTMENT OF AYURVEDA': '632',
    'DEPARTMENT OF PROBATION & CHILD CARE': '633',
    'DEPARTMENT OF SOCIAL WELFARE': '634',
    // MINISTRY OF CO-OPERATIVE
    'DEPARTMENT OF CO-OPERATIVE DEVELOPMENT': '641',
    'DEPARTMENT OF INDUSTRIAL DEVELOPMENT': '642',
    'ROAD PASSENGER TRANSPORT SERVICE AUTHORITY': '644',
    // MINISTRY OF LOCAL GOVERNMENT
    'DEPARTMENT OF LOCAL GOVERNMENT': '611',
    'DEPARTMENT OF RURAL DEVELOPMENT': '653',
    'PROVINCIAL ROAD DEVELOPMENT AUTHORITY': '654',
    // OTHER
    'CHIEF SECRETARY OFFICE': '660',
    'DEPARTMENT OF TREASURY': '661',
    'DEPARTMENT OF PLANNING': '662',
    'DEPARTMENT OF PROVINCIAL ENGINEERING': '663',
    'INTERNAL AUDIT & INVESTIGATION': '664',
    'DEPARTMENT OF PROVINCIAL REVENUE': '665',
};

const DIVISION_CODES = {
    'Anuradhapura-East': 'ANU E',
    'Anuradhapura-West': 'ANU W',
    'Medawachchiya': 'MED',
    'Mihinthale': 'MIH',
    'Kekirawa': 'KEK',
    'Thambuttegama': 'THA',
    'Polonnaruwa': 'POL',
    'Hingurakgoda': 'HIN',
};

// Helper to generate the Estimation No. for a new job
const generateEstimationNo = async ({ division, ministry, department, work, dateReq }) => {
    const workCode = work === 'R' ? 'R' : 'N';
    const divCode = DIVISION_CODES[division] || division;
    const deptCode = DEPARTMENT_CODES[department] || MINISTRY_CODES[ministry] || '000';

    const reqDate = dateReq ? new Date(dateReq) : new Date();
    const year = reqDate.getFullYear();
    const yearCode = String(year).slice(-2);
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    const countSameGroup = await Project.countDocuments({
        division,
        department,
        work: workCode,
        dateReq: { $gte: yearStart, $lt: yearEnd }
    });

    const serial = String(countSameGroup + 1).padStart(2, '0');
    return `${yearCode}-${divCode}-${deptCode}-${workCode}-${serial}`;
};

// 1. Create a New Project (Admin)
exports.createProject = async (req, res) => {
    try {
        const { jobName, ministry, department, division, work, allocation, dateReq, ref, institute, deptIdNo, source, dsDivision, remark } = req.body;
        const jobNo = await generateJobNo();
        const workCode = work || 'N';
        const estimationNo = await generateEstimationNo({ division, ministry, department, work: workCode, dateReq });

        const newProject = new Project({
            jobNo, estimationNo, jobName, ministry, department, division, work: workCode, allocation, dateReq, ref, institute,
            deptIdNo: deptIdNo || '', source: source || '', dsDivision: dsDivision || '', remark: remark || '',
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
        const existing = await Project.findOne({ jobNo });
        if (!existing) return res.status(404).json({ message: "Job not found" });

        const updates = { ...req.body };
        // Backfill Estimation No. for legacy jobs that predate this field
        if (!existing.estimationNo && !updates.estimationNo) {
            const { division, ministry, department, work, dateReq } = updates;
            updates.estimationNo = await generateEstimationNo({
                division: division || existing.division,
                ministry: ministry || existing.ministry,
                department: department || existing.department,
                work: work || existing.work,
                dateReq: dateReq || existing.dateReq
            });
        }

        const updatedProject = await Project.findOneAndUpdate({ jobNo }, updates, { new: true });
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