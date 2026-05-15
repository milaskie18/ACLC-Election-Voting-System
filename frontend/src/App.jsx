import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import StudentBallot from './pages/StudentBallot';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/ballot" element={<StudentBallot />} />
            </Routes>
        </Router>
    );
}

export default App;