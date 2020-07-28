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

require('./blockchain')(redisClient)
  .catch((err) => log.error('BLOCKCHAIN UPDATER:', err));

require('./admin')(redisClient)
  .catch((err) => log.error('ADMINS UPDATER:', err));

require('./socket')(redisClient);

schedule.scheduleJob('* * * * *', (fireDate) => {
  log.info(`run blockchain update job ${fireDate}`);
  require('./blockchain')(redisClient)
    .catch((err) => log.error('BLOCKCHAIN UPDATER:', err));
});

// schedule.scheduleJob('0/10 * * * *', (fireDate) => {
//   log.info(`run admin accounts update job ${fireDate}`);
//   require('./admin')(redisClient)
//     .catch((err) => log.error('ADMINS UPDATER:', err));
// });
// schedule.scheduleJob('* * * * *', (fireDate) => {

// })

setInterval(() => {
  require('./pedding-tweets')(redisClient)
    .catch((err) => log.error('pedding-tweets ERROR:', err));
}, 5000);

// if (ENV === 'test') {
//   log.warn('STRESS_TEST has runed!!!');
//   require('../stress-test')();
// }
