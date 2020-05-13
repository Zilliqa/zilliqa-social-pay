require('dotenv').config();

const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'tx-handler' });
const redis = require('redis');
const { Op } = require('sequelize');
const { validation } = require('@zilliqa-js/util');
const models = require('../models');

const { Job, QueueWorker } = require('../job');
const verifyTweet = require('./verify-tweet');
const configureUsers = require('./configure-users');

const JOB_TYPES = require('../config/job-types');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];

if (!validation.isBech32(CONTRACT_ADDRESS)) {
  throw new Error('incorect contract address');
}

const { User, Twittes, Admin, blockchain } = models.sequelize.models;
const redisSender = redis.createClient(REDIS_CONFIG.url);

function redisSend(model, payload) {
  if (!model || !payload) {
    return null;
  }

  redisSender.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
    body: {
      id: payload.id
    },
    model: model.tableName
  }));
}

async function taskHandler(task, jobQueue) {
  switch (task.type) {

    case JOB_TYPES.verifyTweet:
      try {
        const tweet = await verifyTweet(task, jobQueue.name, redisSender);
        jobQueue.taskDone(task);
        log.info('SUCCESS', 'task:', task.type, 'admin:', jobQueue.name);
        redisSend(Twittes, tweet);
      } catch (err) {
        log.error('ERROR', err, 'task:', task.type);
        jobQueue.next(task);
      }
      break;

    case JOB_TYPES.configureUsers:
      try {
        const user = await configureUsers(task, jobQueue.name);
        jobQueue.taskDone(task);
        log.info('task:', task.type, 'admin:', jobQueue.name);
        redisSend(User, user);
      } catch (err) {
        log.error(err, 'task:', task.type, 'admin:', jobQueue.name, JSON.stringify(task, null, 4));
        jobQueue.next(task);
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

  if (!blockchainInfo) {
    throw new Error('NEXT');
  }

  const admins = await Admin.findAll({
    where: {
      status: new Admin().statuses.enabled,
      balance: {
        [Op.gte]: '5000000000000' // 5ZILs
      }
    },
    order: [
      ['balance', 'DESC'],
      ['nonce', 'ASC']
    ],
    attributes: [
      'bech32Address'
    ]
  });
  const keys = admins.map((el) => el.bech32Address);
  const worker = new QueueWorker(keys);
  const tweets = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      txId: null,
      claimed: true,
      block: {
        [Op.lt]: Number(blockchainInfo.BlockNum)
      }
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

  log.info('tasks', tweets.count + users.count, 'will add to queue.');

  const tasks = tweets.rows.map((tweet) => {
    try {
      const payload = {
        tweetId: tweet.id,
        userId: tweet.User.id
      };
      return new Job(JOB_TYPES.verifyTweet, payload);
    } catch (err) {
      log.error('task', JOB_TYPES.verifyTweet, err);

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

  log.info(tweets.count + users.count, 'tasks added to queue');

  worker.redisSubscribe.on('message', (channel, message) => {
    try {
      let payload = {};
      let type = null;
      const body = JSON.parse(message);

      switch (body.type) {
        case JOB_TYPES.configureUsers:
          payload.userId = body.userId;
          type = body.type;
          break;
        case JOB_TYPES.verifyTweet:
          payload.userId = body.userId;
          payload.tweetId = body.tweetId;
          type = body.type;
          break;
        case Admin.tableName:
          const newJob = worker.addJobQueues(body.address);
          newJob.addListener(newJob.events.trigger, (task) => taskHandler(task, newJob));
          return null;
        default:
          return null;
      }

      const job = new Job(type, payload);

      worker.addTask(job);
    } catch (err) {
      log.error('channel:', channel, 'message', message, 'error', err);
    }
  });
}

queueFilling()
  .catch((err) => {
    log.error('queueFilling', err);

    const interval = setInterval(() => {
      queueFilling()
        .then(() => clearInterval(interval))
        .catch((e) => log.error('queueFilling', e));
    }, 5000);
  });
