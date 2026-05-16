const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // This tells Mongoose to use your Render Environment Variable, 
        // or fall back to your localhost database if you are testing on your computer.
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aclc_voting');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;