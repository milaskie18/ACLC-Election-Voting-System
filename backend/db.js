const mongoose = require("mongoose");

const mongoURL = "mongodb://localhost:27017/myapp";
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURL);
        console.log('MongoDB connected');
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }

};

module.exports = connectDB;
