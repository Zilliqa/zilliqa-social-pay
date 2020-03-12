const schedule = require('node-schedule');
const debug = require('debug')('zilliqa-social-pay:scheduler');

schedule.scheduleJob('* * * * *', (fireDate) => {
  debug(`run update blockchain job ${fireDate}`);
  require('./blockchain')();
});

schedule.scheduleJob('42 * * * *', (fireDate) => {
  debug(`run VerifyTweet job ${fireDate}`);
  require('./tweets')();
});
