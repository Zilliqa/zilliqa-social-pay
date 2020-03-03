require('custom-env').env();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');

require('./passport-setup');

const models = require('./models');

const indexRouter = require('./routes/index');

const app = express();

app.set('models', models.sequelize.models);

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;
