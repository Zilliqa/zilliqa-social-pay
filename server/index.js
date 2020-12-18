require('dotenv').config();

const bunyan = require('bunyan');
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
const redis = require('redis');
const swaggerUi = require('swagger-ui-express');
const swagger = require('./swagger');
const socketRoute = require('./routes/socket');
const socketMiddleware = require('./middleware/socket-auth');
const PACKAGE = require('../package.json');

const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('./config/redis')[ENV];
const port = process.env.PORT || 3000;
const dev = true;// ENV === 'development';
const redisClientSubscriber = redis.createClient(REDIS_CONFIG.url);
const redisClientSender = redis.createClient(REDIS_CONFIG.url);
const log = bunyan.createLogger({ name: 'next-server' });
const app = next({ dev, dir: './' });
const indexRouter = require('./routes/index');

const blockchainCache = require('./middleware/blockchain-cache');
const siteKey = require('./middleware/site-key');

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

server.set('redis', redisClientSender);
server.set('log', log);

server.use('/', siteKey, blockchainCache, indexRouter);

if (dev) {
  server.use('/swagger.json', (req, res) => {
    res.json(swagger);
  });
  server.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swagger));
}

redisClientSubscriber.on('error', (err) => {
  log.error('redis:', err);
});

redisClientSubscriber.subscribe(REDIS_CONFIG.channels.WEB);

app
  .prepare()
  .then(() => {
    // handling everything else with Next.js
    server.get('*', handle);

    http = http.createServer(server);

    const io = socket(http);

    io.engine.generateId = function(req) {
      try {
        const session = req.headers.cookie.split('; ');
        let userInBase64 = session.find((s) => s.includes(`${process.env.SESSION}=`));  
        userInBase64 = userInBase64.replace(`${process.env.SESSION}=`, '');
        const body = Buffer.from(userInBase64, 'base64').toString('utf-8');
        const { passport } = JSON.parse(body);

        return passport.user.profileId;
      } catch (err) {
        return null;
      }
    }

    io.use(socketMiddleware);
 
    redisClientSubscriber.on('message', (channel, message) => {
      try {
        socketRoute(io, message);
      } catch (err) {
        log.error('SOCKET', err);
      }
    });

    http.listen(port, () => {
      log.info('SocialPay version', PACKAGE.version);
      log.info('redis version', redisClientSubscriber.server_info.redis_version);
      log.info('listening on port', port);
    });
  });
