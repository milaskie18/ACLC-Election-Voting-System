const mongoose = require('mongoose');

const electionStateSchema = new mongoose.Schema({
    vote_available: {
        type: Boolean,
        default: false
    },
    startTimestamp: {
        type: Date
    },
    endTimestamp: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('ElectionState', electionStateSchema);