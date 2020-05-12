require('dotenv').config();

const bunyan = require('bunyan');
const schedule = require('node-schedule');
const log = bunyan.createLogger({ name: 'scheduler:blockchain' });

require('./blockchain')();
require('./admin')();
require('./socket')();

// schedule.scheduleJob('* * * * *', (fireDate) => {
//   log.info(`run blockchain update job ${fireDate}`);
//   require('./blockchain')();
// });

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
  require('./pedding-tweets')();
});

schedule.scheduleJob('* * * * *', (fireDate) => {
  log.info(`run check broken users ${fireDate}`);
  require('./pedding-users')();
});
