import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import StudentBallot from './pages/StudentBallot';
import CandidateApplication from './pages/CandidateApplication'; // <-- ADD THIS IMPORT
import CandidateDashboard from './pages/CandidateDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/ballot" element={<StudentBallot />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/apply" element={<CandidateApplication />} /> {/* <-- ADD THIS ROUTE */}
        <Route path="/" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;