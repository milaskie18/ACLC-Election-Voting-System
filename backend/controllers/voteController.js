const User = require('../models/User');
const Candidate = require('../models/Candidate');

// @desc    Submit a user's vote
// @route   POST /api/votes/submit
const submitVote = async (req, res) => {
    try {
        const { userId, candidateIds } = req.body;

        if (!userId || !candidateIds || !Array.isArray(candidateIds)) {
            return res.status(400).json({ message: 'Invalid vote data provided.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if user has already voted
        if (user.alreadyVoted) {
            return res.status(400).json({ message: 'User has already cast a vote.' });
        }

        // Transaction 1: Increment votes for all selected candidates
        await Candidate.updateMany(
            { _id: { $in: candidateIds } },
            { $inc: { votes: 1 } }
        );

        // Transaction 2: Update the User document
        user.alreadyVoted = true;
        user.votedCandidates = candidateIds;
        await user.save();

        res.status(200).json({ message: 'Vote submitted successfully!' });
    } catch (error) {
        console.error("Error submitting vote:", error);
        res.status(500).json({ message: 'Server error while submitting vote.' });
    }
};

module.exports = { submitVote };