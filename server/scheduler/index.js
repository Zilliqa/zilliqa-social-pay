require('dotenv').config();

const schedule = require('node-schedule');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'scheduler:blockchain' });
const redis = require('redis');
const { validation } = require('@zilliqa-js/util');

const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!validation.isBech32(CONTRACT_ADDRESS)) {
  throw new Error('incorect contract address');
}

const redisClient = redis.createClient(REDIS_CONFIG.url);

require('./blockchain')(redisClient);
require('./admin')();
require('./socket')(redisClient);

schedule.scheduleJob('* * * * *', (fireDate) => {
  log.info(`run blockchain update job ${fireDate}`);
  require('./blockchain')(redisClient);
});

// schedule.scheduleJob('0/1 * * * *', (fireDate) => {
//   log.info(`run admin accounts update job ${fireDate}`);
//   require('./admin')();
// });

// schedule.scheduleJob('* * * * *', (fireDate) => {
//   log.info(`run user address configure ${fireDate}`);
//   require('./user-configure')();
// });

// schedule.scheduleJob('* * * * *', (fireDate) => {
//   log.info(`run VerifyTweet job ${fireDate}`);
//   require('./tweets')();
// });

schedule.scheduleJob('* * * * *', (fireDate) => {
  log.info(`run check broken tweets ${fireDate}`);
  require('./pedding-tweets')(redisClient);
});

schedule.scheduleJob('* * * * *', (fireDate) => {
  log.info(`run check broken users ${fireDate}`);
  require('./pedding-users')(redisClient);
});
