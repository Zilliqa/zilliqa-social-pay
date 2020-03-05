const express = require('express');
const router = express.Router();

const twitter = require('./twitter');

router.use('/api/v1', twitter);

module.exports = router;
