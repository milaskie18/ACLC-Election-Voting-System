const express = require('express');
const router = express.Router();
const { submitVote } = require('../controllers/voteController');

router.post('/submit', submitVote);

module.exports = router;