require('dotenv').config();

const schedule = require('node-schedule');
const debug = require('debug')('zilliqa-social-pay:scheduler');

require('./blockchain')();

schedule.scheduleJob('* * * * *', (fireDate) => {
  debug(`run update blockchain job ${fireDate}`);
  require('./blockchain')();
});

schedule.scheduleJob('* * * * *', (fireDate) => {
  debug(`run accounts update job ${fireDate}`);
  require('./admin')();
});

schedule.scheduleJob('* * * * *', (fireDate) => {
  debug(`run user address configure ${fireDate}`);
  require('./user-configure')();
});

schedule.scheduleJob('* * * * *', (fireDate) => {
  debug(`run VerifyTweet job ${fireDate}`);
  require('./tweets')();
});

schedule.scheduleJob('* * * * *', (fireDate) => {
  debug(`run check broken tweets job ${fireDate}`);
  require('./peddling-tweets')();
});
