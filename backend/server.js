const express = require('express');
const connectDB = require('./db');
const cors = require('cors');

// Connect to DB
connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("MongoDB connection successful!");
});

app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from the Node backend!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});