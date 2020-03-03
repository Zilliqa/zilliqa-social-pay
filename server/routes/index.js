const express = require('express');
const router = express.Router();

const twitter = require('./twitter');

router.use('/api/v1', twitter);
// router.route('/auth/me')
//   .get(authenticate, getCurrentUser, getOne);

module.exports = router;
