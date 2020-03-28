require('dotenv').config();

const debug = require('debug')('zilliqa-social-pay:server');
const express = require('express');
const socket = require('socket.io');
const cookieSession = require('cookie-session');
let http = require('http');
const next = require('next');
const passport = require('passport');
const uuidv4 = require('uuid').v4;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const server = express();
const socketRoute = require('./routes/socket');
const socketMiddleware = require('./middleware/socket-auth');
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
const session = cookieSession({
  name: process.env.SESSION,
  keys: [
    dev ? 'key0' : uuidv4(),
    dev ? 'key1' : uuidv4()
  ],

  // Cookie Options
  maxAge: (24 * 60 * 60 * 1000), // 24 hours
  httpOnly: true
});

require('./passport-setup');

server.use(cookieParser());
server.use(session);

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
  .then((accounts) => {
    accounts.forEach((account, index) => {
      const address = account.bech32Address;
      const balance = zilliqa.fromZil(account.balance);
      debug(`admin ${index}: ${address}, balance: ${balance}, status: ${account.status}`);
    });

    // handling everything else with Next.js
    server.get('*', handle);

    http = http.createServer(server);

    const io = socket(http);

    io.use(socketMiddleware);

    io.on('connection', (socket) => {
      const cookieString = socket.request.headers.cookie;

      const req = {
        connection: {
          encrypted: false
        },
        headers: {
          cookie: cookieString
        }
      };
      const res = {
        getHeader: () => {},
        setHeader: () => {}
      };

      session(req, res, () => {
        if (req.session && req.session.passport && req.session.passport.user) {
          socket.user = req.session.passport.user;

          socketRoute(socket);
        }
      });
    });

    http.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });

require('./scheduler');
