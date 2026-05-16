import axios from 'axios';

const api = axios.create({
    // UPDATE THIS LINE EXACTLY:
    baseURL: 'https://aclc-election-voting-system.onrender.com/api'
});

// Leave the rest of your interceptors/code exactly as they are