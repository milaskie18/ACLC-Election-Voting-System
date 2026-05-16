import axios from 'axios';

const api = axios.create({
    baseURL: 'https://aclc-election-voting-system.onrender.com/api' 
});

// If you have interceptors for the token, they go here
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// THIS IS THE LINE THAT IS MISSING/BROKEN:
export default api;