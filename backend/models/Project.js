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
    
    // System Tracking
    submitDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Ongoing', 'Completed'], 
        default: 'Pending' 
    },
    
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