const debug = require('debug')('zilliqa-social-pay:tx-handler');
const { Op } = require('sequelize');
const models = require('../models');

const { QueueEmitter, Job } = require('../job');
const verifyTweet = require('./verify-tweet');

const JOB_TYPES = require('../config/job-types');
const jobQueue = new QueueEmitter('tx/handler');

const { User, Twittes } = models.sequelize.models;

jobQueue.addListener(jobQueue.events.trigger, async (task) => {
  switch (task.type) {

    case JOB_TYPES.verifyTweet:
      try {
        await verifyTweet(task);
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
});

async function queueFillingTweets() {
  // for (let index = 0; index < 1000; index++) {
  //   await Twittes.create({
  //     approved: false,
  //     rejected: false,
  //     txId: null,
  //     claimed: true,
  //     UserId: 1,
  //     idStr: uuids.v1(),
  //     text: `#Zilliqa ${uuids.v1()}`
  //   });

  //   debug(index, 'tweets added to queue');
  // }
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

  tweets.rows.forEach((tweet) => {
    try {
      const payload = {
        tweetId: tweet.id,
        userId: tweet.User.id
      };
      const job = new Job(JOB_TYPES.verifyTweet, payload, tweet.id);

      jobQueue.addTask(job);
    } catch (err) {
      debug('ERROR', err);
    }
  });

  debug(tweets.count, 'tweets added to queue');
}

module.exports = {
  queueFillingTweets
};
