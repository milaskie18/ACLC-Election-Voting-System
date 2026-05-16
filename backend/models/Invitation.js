const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
    },
    partylistName: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending',
    },
    invitedBy: {
        type: String, // studentId of the founder
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invitation', invitationSchema);