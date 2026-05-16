const express = require('express');
const router = express.Router();
const { bulkRegister, getUserInvitations, getUserStatus } = require('../controllers/userController');

// User Actions
router.post('/bulk-register', bulkRegister);

// User Status
router.get('/:id', getUserStatus);

// Invitations
router.get('/:id/invitations', getUserInvitations);

module.exports = router;