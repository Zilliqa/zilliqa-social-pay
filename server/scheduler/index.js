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

try {
  require('./blockchain')(redisClient);
} catch (err) {
  log.error('BLOCKCHAIN UPDATER:', err);
}

try {
  require('./admin')(redisClient);
} catch (err) {
  log.error('ADMINS UPDATER:', err);
}

try {
  require('./socket')(redisClient);
} catch (err) {
  log.error('SOCKET CONNECTOR:', err);
}

schedule.scheduleJob('* * * * *', (fireDate) => {
  log.info(`run blockchain update job ${fireDate}`);
  try {
    require('./blockchain')(redisClient);
  } catch (err) {
    log.error('BLOCKCHAIN UPDATER:', err);
  }
});

schedule.scheduleJob('0/5 * * * *', (fireDate) => {
  log.info(`run admin accounts update job ${fireDate}`);
  try {
    require('./admin')(redisClient);
  } catch (err) {
    log.error('ADMINS UPDATER:', err);
  }
});

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
  try {
    require('./pedding-tweets')(redisClient);
  } catch (err) {
    log.error('HANDLER BROKEN TWEETS:', err);
  }
});

schedule.scheduleJob('* * * * *', (fireDate) => {
  log.info(`run check broken users ${fireDate}`);
  try {
    require('./pedding-users')(redisClient);
  } catch (err) {
    log.error('HANDLER BROKEN USERS:', err);
  }
});

if (ENV === 'test') {
  log.warn('STRESS_TEST has runed!!!');
  require('../stress-test')();
}
