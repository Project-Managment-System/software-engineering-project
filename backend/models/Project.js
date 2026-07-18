const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    // Primary Key
    jobNo: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    
    // Core Project Data
    jobName: { type: String, required: true },
    division: { type: String, required: true }, // Used for Engineer filtering
    ministry: { type: String, required: true },
    department: { type: String, required: true },
    institute: String,
    allocation: { type: String, required: true }, // Store as string or Number based on preference
    dateReq: { type: Date, required: true },
    ref: { type: String, required: true }, // Request Letter Reference
    assignee: { 
        type: String, 
        default: "" 
    },
    // System Tracking
    submitDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Ongoing', 'Completed'], 
        default: 'Pending' 
    },
    
    // Additional admin-entered fields
    deptIdNo:   { type: String, default: '' },
    source:     { type: String, default: '' },
    dsDivision: { type: String, default: '' },
    remark:     { type: String, default: '' },

    // User Portal Estimate & Drawing Fields
    fieldVisitedDate: { type: Date },
    fieldEstimateAmount: { type: Number },
    estimateSubmitted: { type: Boolean, default: false },
    estimateSubmittedAt: { type: Date },
    drawingReceived: { type: Boolean, default: false },
    drawingReceivedAt: { type: Date },
    drawingFileUrl: { type: String, default: '' },
    finalEstimateCost: { type: Number },
    finalEstimateDate: { type: Date },

    // Optional: Keep track of who assigned it if needed, 
    // though the system handles this via division
    assignedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

// Pre-save hook to ensure the job status can be reverted/updated
//ProjectSchema.pre('save', function(next) {
    // Logic for validation can be placed here
   // next();
//});

module.exports = mongoose.model('Project', ProjectSchema);