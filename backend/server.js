const express = require('express');
const connectDB = require('./db');
const cors = require('cors');
require('dotenv').config(); // Good practice to load local .env files if you use them

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const voteRoutes = require('./routes/voteRoutes');
const candidateRoutes = require('./routes/candidateRoutes');



// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware MUST go first
app.use(cors());
app.use(express.json());

// 2. Routes go SECOND
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/candidates', candidateRoutes);


// --- TEMPORARY EMERGENCY ADMIN SEEDER ---
app.get("/api/seed-emergency-admin", async (req, res) => {
    try {
        const adminExists = await User.findOne({ studentId: 'admin' });
        if (adminExists) {
            return res.send("Admin already exists! Go log in.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            studentId: 'admin',
            lastName: 'Administrator',
            password: hashedPassword,
            approvalStatus: 'approved'
        });

        res.send("✅ SUCCESS! Admin account created. You can now log in with admin / admin123");
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

app.get("/", (req, res) => {
    res.send("API is running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});