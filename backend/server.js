const express = require('express');
const connectDB = require('./db');

// Connect to DB
connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("MongoDB connection successful!");
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});