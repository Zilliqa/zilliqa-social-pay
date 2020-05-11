const debug = require('debug')('zilliqa-social-pay:tx-handler');
const { Op } = require('sequelize');
const models = require('../models');

const { Job, QueueWorker } = require('../job');
const verifyTweet = require('./verify-tweet');
const configureUsers = require('./configure-users');

const JOB_TYPES = require('../config/job-types');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const { User, Twittes, Admin, blockchain } = models.sequelize.models;

async function taskHandler(task, jobQueue) {
  switch (task.type) {

    case JOB_TYPES.verifyTweet:
      try {
        await verifyTweet(task, jobQueue.name);
        jobQueue.taskDone(task);
        debug('SUCCESS', 'task:', task.type, 'admin:', jobQueue.name);
      } catch (err) {
        jobQueue.next(task);
        debug('ERROR', err.message, 'task:', task.type);
      }
      break;

    case JOB_TYPES.configureUsers:
      try {
        await configureUsers(task, jobQueue.name);
        jobQueue.taskDone(task);
        debug('SUCCESS', 'task:', task.type, 'admin:', jobQueue.name);
      } catch (err) {
        jobQueue.next(task);
        debug('ERROR', err.message, 'task:', task.type, 'admin:', jobQueue.name, JSON.stringify(task, null, 4));
      }
      break;

    default:
      jobQueue.taskDone(task);
      break;
  }
}

async function queueFilling() {
  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const admins = await Admin.findAll({
    where: {
      status: new Admin().statuses.enabled,
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
  const users = await User.findAndCountAll({
    where: {
      synchronization: true,
      zilAddress: {
        [Op.not]: null
      },
      lastAction: {
        [Op.lte]: Number(blockchainInfo.BlockNum)
      },
      hash: null,
      status: new User().statuses.enabled
    },
    attributes: [
      'id'
    ]
  });

  worker.jobQueues.forEach((jobQueue) => {
    jobQueue.addListener(jobQueue.events.trigger, (task) => taskHandler(task, jobQueue));
  });

  debug('INFO', 'tasks', tweets.count + users.count, 'will add to queue.');

  const tasks = tweets.rows.map((tweet) => {
    try {
      const payload = {
        tweetId: tweet.id,
        userId: tweet.User.id
      };
      return new Job(JOB_TYPES.verifyTweet, payload);
    } catch (err) {
      debug('ERROR', 'task', JOB_TYPES.verifyTweet, err);

      return null;
    }
  }).filter(Boolean).concat(users.rows.map((user) => {
    try {
      const payload = {
        userId: user.id
      };
      return new Job(JOB_TYPES.configureUsers, payload);
    } catch (err) {
      debug('ERROR', 'task', JOB_TYPES.verifyTweet, err);

      return null;
    }
  }));

  worker.distributeTasks(tasks);

  debug(tweets.count + users.count, 'tasks added to queue');

  User.addHook('afterUpdate', (user) => {
    if (!user.synchronization) {
      return null;
    }

    const payload = {
      userId: user.id
    };
    const job = new Job(JOB_TYPES.configureUsers, payload);

    worker.addTask(job);

    debug('User added to queue', user.id);
  });
  Twittes.addHook('afterUpdate', (tweet) => {
    if (tweet.approved || tweet.rejected || tweet.claimed || tweet.txId) {
      return null;
    }

    const payload = {
      tweetId: tweet.id,
      userId: tweet.UserId
    };
    const job = new Job(JOB_TYPES.verifyTweet, payload);

    worker.addTask(job);

    debug('Tweet added to job', tweet.id, );
  });
}

module.exports = {
  queueFilling
};
