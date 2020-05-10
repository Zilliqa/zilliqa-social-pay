const debug = require('debug')('zilliqa-social-pay:tx-handler');
const { Op } = require('sequelize');
const models = require('../models');

const { Job, QueueWorker } = require('../job');
const verifyTweet = require('./verify-tweet');

const JOB_TYPES = require('../config/job-types');

const { User, Twittes, Admin } = models.sequelize.models;
const statuses = new Admin().statuses;

async function taskHandler(task, jobQueue) {
  switch (task.type) {

    case JOB_TYPES.verifyTweet:
      try {
        await verifyTweet(task, jobQueue.name);
        debug('SUCCESS', 'task:', JSON.stringify(task, null, 4));
      } catch (err) {
        debug('ERROR', 'task:', task.type, err, JSON.stringify(task, null, 4));
      } finally {
        jobQueue.taskDone(task);
      }
      break;

    case JOB_TYPES.configureUsers:
      JSON.stringify(task, null, 4);
      jobQueue.taskDone(task);
      break;

    default:
      jobQueue.taskDone(task);
      break;
  }
}

async function queueFillingTweets() {
  const admins = await Admin.findAll({
    where: {
      status: statuses.enabled,
      balance: {
        [Op.gte]: '5000000000000' // 5ZILs
      }
    },
    attributes: [
      'bech32Address'
    ]
  }).map((el) => el.bech32Address);
  const worker = new QueueWorker(admins);
  const tweets = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      txId: null,
      claimed: true
    },
    include: {
      model: User,
      where: {
        synchronization: false,
        zilAddress: {
          [Op.not]: null
        }
      },
      attributes: [
        'id'
      ]
    },
    attributes: [
      'id'
    ]
  });

  worker.jobQueues.forEach((jobQueue) => {
    jobQueue.addListener(jobQueue.events.trigger, (task) => taskHandler(task, jobQueue));
  });

  debug('INFO', tweets.count, 'will add to queue.');

  const tasks = tweets.rows.map((tweet) => {
    try {
      const payload = {
        tweetId: tweet.id,
        userId: tweet.User.id
      };
      return new Job(JOB_TYPES.verifyTweet, payload, tweet.id);
    } catch (err) {
      debug('ERROR', 'task', JOB_TYPES.verifyTweet, err);

      return null;
    }
  }).filter(Boolean);

  worker.distributeTasks(tasks);

  debug(tweets.count, 'tweets added to queue');
}

module.exports = {
  queueFillingTweets
};
