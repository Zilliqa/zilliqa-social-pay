require('dotenv').config();

const express = require('express');
const http = require('http');
const next = require('next');
const passport = require('passport');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
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


  // initalize passport
  server.use(passport.initialize());
  server.use(express.json());
  server.use(express.urlencoded({ extended: false }));

  server.use('/', indexRouter);

  // handling everything else with Next.js
  server.get('*', handle);

  http.createServer(server).listen(port, () => {
    console.log(`listening on port ${port}`);
  });
});
