require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
const http = require('http');
const next = require('next');
const passport = require('passport');
const uuidv4 = require('uuid').v4;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const server = express();
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

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: true }))
 
// parse application/json
server.use(bodyParser.json());

server.use('/', indexRouter);

app
  .prepare()
  .then(() => zilliqa.generateAddresses(process.env.NUMBER_OF_ADMINS))
  .then((address) => {
    console.log(address)

    // handling everything else with Next.js
    server.get('*', handle);

    http.createServer(server).listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });

if (dev) {
  require('./scheduler');
}
