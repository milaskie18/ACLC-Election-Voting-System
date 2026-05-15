const ElectionState = require('../models/ElectionState');

// @desc    Get current election state
// @route   GET /api/admin/election-state
const getElectionState = async (req, res) => {
    try {
        // Find the single state document, create it if it doesn't exist
        let state = await ElectionState.findOne();
        if (!state) {
            state = await ElectionState.create({ vote_available: false });
        }
        res.status(200).json(state);
    } catch (error) {
        console.error("Error fetching election state:", error);
        res.status(500).json({ message: 'Server error while fetching state.' });
    }
};

// @desc    Toggle election state (Start/End)
// @route   POST /api/admin/election-state/toggle
const toggleElection = async (req, res) => {
    try {
        const { vote_available } = req.body;
        
        let state = await ElectionState.findOne();
        if (!state) {
            state = new ElectionState();
        }

        // Update the boolean and timestamps based on the action
        state.vote_available = vote_available;
        if (vote_available) {
            state.startTimestamp = new Date();
        } else {
            state.endTimestamp = new Date();
        }

        await state.save();
        res.status(200).json({ message: 'Election state updated', state });
    } catch (error) {
        console.error("Error toggling election state:", error);
        res.status(500).json({ message: 'Server error while toggling state.' });
    }
};

module.exports = {
    getElectionState,
    toggleElection
};