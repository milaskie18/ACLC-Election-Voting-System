const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, denyUser } = require('../controllers/userController');

router.get('/pending', getPendingUsers);
router.put('/:id/approve', approveUser);
router.put('/:id/deny', denyUser);

module.exports = router;