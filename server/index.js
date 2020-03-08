require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
const http = require('http');
const next = require('next');
const passport = require('passport');
const uuidv4 = require('uuid').v4;

const ENV = process.env.NODE_ENV;
const port = process.env.PORT || 3000;
const dev = ENV !== 'production';
const models = require('./models');
const app = next({
  dev,
  dir: './'
});
const indexRouter = require('./routes/index');
const handle = app.getRequestHandler();

require('./passport-setup');

app.prepare().then(() => {
  const server = express();

  server.use(cookieSession({
    name: process.env.SESSION,
    keys: [
      dev ? 'key0' : uuidv4(),
      dev ? 'key1' : uuidv4()
    ],
  
    // Cookie Options
    maxAge: (24 * 60 * 60 * 1000), // 24 hours
    httpOnly: true
  }));

  // initalize passport
  server.use(passport.initialize());
  server.use(passport.session());

  server.use(express.json());
  server.use(express.urlencoded({ extended: false }));

  server.use('/', indexRouter);

  // handling everything else with Next.js
  server.get('*', handle);

  http.createServer(server).listen(port, () => {
    console.log(`listening on port ${port}`);
  });
});
