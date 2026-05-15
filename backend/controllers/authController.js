const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    // Using a fallback secret for development if env var is missing
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    return jwt.sign({ id }, secret, { expiresIn: '1d' });
};

// @desc    Register a new user (Student)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { studentId, lastName, password } = req.body;

        if (!studentId || !lastName || !password) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ studentId });
        if (userExists) {
            return res.status(400).json({ message: 'User with this Student ID already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            studentId,
            lastName,
            password: hashedPassword
            // approvalStatus will default to 'pending' as defined in schema
        });

        if (user) {
            res.status(201).json({
                message: 'Registration successful. Please wait for admin approval.',
                userId: user._id
            });
        } else {
            res.status(400).json({ message: 'Invalid user data received.' });
        }
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// @desc    Login a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { studentId, password } = req.body;

        const user = await User.findOne({ studentId });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Flowchart Logic Checks for Approval Status
            if (user.approvalStatus === 'pending') {
                return res.status(403).json({ message: 'Please wait for Admin Approval.' });
            } else if (user.approvalStatus === 'denied') {
                return res.status(403).json({ message: 'Registration Denied.' });
            }

            // If approved, return JWT token and user info
            res.status(200).json({
                _id: user.id,
                studentId: user.studentId,
                lastName: user.lastName,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid Student ID or password.' });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = { registerUser, loginUser };