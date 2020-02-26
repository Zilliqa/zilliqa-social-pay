require('custom-env').env();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const TwitterTokenStrategy = require('passport-twitter-token');

const models = require('./models');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

passport.use(new TwitterTokenStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  includeEmail: false
},
function (token, tokenSecret, profile, done) {
  models
    .sequelize
    .models
    .User
    .findOrCreate({
      token,
      tokenSecret,
      username: profile.username,
      profileId: profile.id
    })
    .then(([user]) => done(null, user))
    .catch((err) => done(err, null));
}));

app.set('models', models.sequelize.models);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
