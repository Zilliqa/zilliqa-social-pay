const express = require('express');
const router = express.Router();

const authenticate = require('./auth');

router.post('/request-funds', authenticate);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
