const express = require('express');
const router = express.Router();
const { addCandidate, loadTally, editCandidate, deleteCandidate } = require('../controllers/adminController');
const { getElectionState, toggleElection } = require('../controllers/electionController'); // <-- Add this import

// --- Candidate Routes ---
router.post('/candidates', addCandidate);
router.get('/candidates', loadTally);
router.put('/candidates/:id', editCandidate);
router.delete('/candidates/:id', deleteCandidate);

// --- Election State Routes ---
router.get('/election-state', getElectionState); // <-- Add this
router.post('/election-state/toggle', toggleElection); // <-- Add this

module.exports = router;