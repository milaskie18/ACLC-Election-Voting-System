const express = require('express');
const router = express.Router();

// Import the controller functions (Make sure these exist in your candidateController!)
const { 
    applyIndependent, 
    applyPartylist, 
    acceptInvite, 
    declineInvite 
} = require('../controllers/candidateController');

// Route for Independent application
router.post('/apply', applyIndependent);

// Route for Partylist application (with tagging)
router.post('/apply-partylist', applyPartylist);

// Routes for tagged members to Accept or Decline
router.post('/accept', acceptInvite);
router.post('/decline', declineInvite);

module.exports = router;