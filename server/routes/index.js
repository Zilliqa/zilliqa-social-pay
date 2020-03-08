const express = require('express');
const router = express.Router();

const twitter = require('./twitter');
const local = require('./local');

router.use('/api/v1', twitter, local);

module.exports = router;
