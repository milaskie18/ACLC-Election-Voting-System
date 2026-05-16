const User = require('../models/User');
const Invitation = require('../models/Invitation');
const Candidate = require('../models/Candidate');
const bcrypt = require('bcryptjs');

// @desc    Bulk register users via Admin Masterlist
// @route   POST /api/users/bulk-register
const bulkRegister = async (req, res) => {
    try {
        const { studentIds, defaultPassword } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || !defaultPassword) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of IDs and a default password.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        let createdCount = 0;
        
        for (const studentId of studentIds) {
            // Ignore duplicates to prevent duplicate key errors
            const exists = await User.findOne({ studentId });
            if (!exists) {
                await User.create({
                    studentId,
                    lastName: 'Voter', // Generic fallback, adjust as needed
                    password: hashedPassword,
                    approvalStatus: 'approved', // Bulk generated accounts bypass pending status
                    alreadyVoted: false
                });
                createdCount++;
            }
        }

        res.status(201).json({ message: `Successfully registered ${createdCount} new voter accounts.` });
    } catch (error) {
        console.error("Error in bulk registration:", error);
        res.status(500).json({ message: 'Server error during bulk registration.' });
    }
};

// @desc    Check if a user has any pending partylist invitations
// @route   GET /api/users/:id/invitations
const getUserInvitations = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const invite = await Invitation.findOne({ studentId: user.studentId, status: 'Pending' });
        
        if (invite) return res.status(200).json({ hasInvite: true, inviteDetails: invite });
        return res.status(200).json({ hasInvite: false, inviteDetails: null });
    } catch (error) {
        console.error("Error fetching invitations:", error);
        res.status(500).json({ message: 'Server error while checking invitations.' });
    }
};

// @desc    Get user status including candidate check
// @route   GET /api/users/:id
const getUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const candidate = await Candidate.findOne({ studentId: user.studentId });
        
        res.status(200).json({
            ...user._doc,
            isCandidate: !!candidate
        });
    } catch (error) {
        console.error("Error fetching user status:", error);
        res.status(500).json({ message: 'Server error while fetching user status.' });
    }
};

module.exports = { bulkRegister, getUserInvitations, getUserStatus };