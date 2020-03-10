require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
const http = require('http');
const next = require('next');
const passport = require('passport');
const uuidv4 = require('uuid').v4;
const cookieParser = require('cookie-parser');
const zilliqa = require('./zilliqa');

const ENV = process.env.NODE_ENV;
const port = process.env.PORT || 3000;
const dev = ENV !== 'production';

const app = next({
  dev,
  dir: './'
});
const indexRouter = require('./routes/index');
const handle = app.getRequestHandler();

require('./passport-setup');

app
  .prepare()
  .then(() => zilliqa.getInit())
  .then((contracInit) => {
    const server = express();

    server.set('contract', contracInit);

    server.use(cookieParser());
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

    setInterval(() => {
      zilliqa
        .blockchainInfo()
        .then((info) => server.set('blockchain', info));
    }, 5000);
    zilliqa
        .blockchainInfo()
        .then((info) => server.set('blockchain', info));

    http.createServer(server).listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
