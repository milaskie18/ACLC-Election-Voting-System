const express = require('express');
const router = express.Router();

// Import all functions from controllers
const { 
    addCandidate, 
    editCandidate, 
    deleteCandidate,
    getCandidates,
    getPendingCandidates,
    approveCandidate,
    rejectCandidate
} = require('../controllers/adminController');

const { 
    getElectionState, 
    toggleElection 
} = require('../controllers/electionController');

// --- Candidate Tally & CRUD Routes ---
router.post('/candidates', addCandidate);
router.get('/candidates', getCandidates); // Main Tally Fetch
router.put('/candidates/:id', editCandidate);
router.delete('/candidates/:id', deleteCandidate);

// --- Candidate Approval Routes ---
router.get('/pending-candidates', getPendingCandidates);
router.put('/candidates/:id/approve', approveCandidate);
router.put('/candidates/:id/reject', rejectCandidate);

// --- Election State Routes ---
router.get('/election-state', getElectionState);
router.post('/election-state/toggle', toggleElection);

module.exports = router;