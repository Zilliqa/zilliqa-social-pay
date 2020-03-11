const schedule = require('node-schedule');
const debug = require('debug')('zilliqa-social-pay:scheduler');

schedule.scheduleJob('0/1 * * * *', (fireDate) => {
  debug(`run update blockchain job ${fireDate}`);
  require('./blockchain')();
});
