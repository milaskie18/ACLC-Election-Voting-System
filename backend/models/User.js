const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: 'pending'
    },
    alreadyVoted: {
        type: Boolean,
        default: false
    },
    votedCandidates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);