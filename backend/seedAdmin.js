const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 
const connectDB = require('./db');

const seedAdmin = async () => {
    try {
        // Connect to your local MongoDB
        
        await mongoose.connect('mongodb+srv://jamila:jamila@cluster0.fwlrvoj.mongodb.net/?appName=Cluster0');

        // Check if admin already exists
        const adminExists = await User.findOne({ studentId: 'admin' });
        if (adminExists) {
            console.log('Admin account already exists!');
            process.exit();
        }

        // Hash the password 'admin123'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create the admin user (Forcing the status to 'approved')
        await User.create({
            studentId: 'admin',
            lastName: 'Administrator',
            password: hashedPassword,
            approvalStatus: 'approved' // Bypasses the pending queue
        });

        console.log('✅ Admin account created successfully!');
        console.log('👉 Student ID: admin');
        console.log('👉 Password: admin123');
        process.exit();

    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();