const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Ongoing', 'Completed'], 
        default: 'Pending' 
    },
    manager: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);