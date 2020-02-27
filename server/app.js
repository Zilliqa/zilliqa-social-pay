require('custom-env').env();

const express = require('express');
const cookieSession = require('cookie-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');

require('./passport-setup');

const models = require('./models');

const indexRouter = require('./routes/index');

const app = express();

app.set('models', models.sequelize.models);

app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.JWT_SECRET],
    maxAge: 24 * 60 * 60 * 100
  })
);

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;
