const User = require('../models/User');

// @desc    Get all users with 'pending' approval status
// @route   GET /api/users/pending
const getPendingUsers = async (req, res) => {
    try {
        // Fetch pending users, excluding their password field
        const pendingUsers = await User.find({ approvalStatus: 'pending' }).select('-password');
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending users:", error);
        res.status(500).json({ message: 'Server error while fetching pending users.' });
    }
};

// @desc    Approve a user registration
// @route   PUT /api/users/:id/approve
const approveUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { approvalStatus: 'approved' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User approved successfully.', user });
    } catch (error) {
        console.error("Error approving user:", error);
        res.status(500).json({ message: 'Server error while approving user.' });
    }
};

// @desc    Deny a user registration
// @route   PUT /api/users/:id/deny
const denyUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { approvalStatus: 'denied' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User denied successfully.', user });
    } catch (error) {
        console.error("Error denying user:", error);
        res.status(500).json({ message: 'Server error while denying user.' });
    }
};

module.exports = { getPendingUsers, approveUser, denyUser };