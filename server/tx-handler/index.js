require('dotenv').config();

const _ = require('lodash');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'tx-handler' });
const redis = require('redis');
const { promisify } = require('util');
const { Op } = require('sequelize');
const { validation } = require('@zilliqa-js/util');
const models = require('../models');
const zilliqa = require('../zilliqa');

const { Job, QueueWorker } = require('../job');
const verifyTweet = require('./verify-tweet');

const JOB_TYPES = require('../config/job-types');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];
const MIN_AMOUNT = '50000000000000';
const TWEETS_IN_QUEUE = 10;
const AMOUNT_OF_TASKS = 50;

if (!validation.isBech32(CONTRACT_ADDRESS)) {
  throw new Error('incorect contract address');
}

const { User, Twittes, Admin, blockchain } = models.sequelize.models;
const redisSender = redis.createClient(REDIS_CONFIG.url);
const getAsync = promisify(redisSender.get).bind(redisSender);

function parseHashTags(text, hashtags) {
  text = text.toLowerCase();
  const test = hashtags.every((hashtag) => {
    hashtag = hashtag.toLowerCase();
    return text.includes(hashtag)
  });

  if (test) {
    return hashtags
  }

  return []
}

async function taskHandler(task, jobQueue) {
  try {
    switch (task.type) {

      case JOB_TYPES.verifyTweet:
        await verifyTweet(task, jobQueue.name, redisSender);
        jobQueue.taskDone(task);
        log.info('SUCCESS', 'task:', task.type, 'admin:', jobQueue.name);
        break;

      default:
        jobQueue.taskDone(task);
        break;
    }
  } catch (err) {
    log.error('ERROR', err, 'task:', task.type);
    jobQueue.next(task);

    if (err.message.includes('You do not have enough funds')) {
      process.kill(process.pid, 'SIGHUP');
    }
  }
}

async function getTasks(admins = AMOUNT_OF_TASKS) {
  const blockchainInfo = JSON.parse(await getAsync(blockchain.tableName));

  if (!blockchainInfo) {
    throw new Error('NEXT');
  }

  const blocksForClaim = Number(blockchainInfo.BlockNum) - (Number(blockchainInfo.blocksPerDay));
  let tweets = await Twittes.findAll({
    limit: TWEETS_IN_QUEUE * admins,
    order: [['updatedAt', 'DESC']],
    where: {
      approved: false,
      rejected: false,
      txId: null,
      claimed: true,
      block: {
        [Op.lte]: blockchainInfo.BlockNum
      },
      UserId: {
        [Op.not]: null
      }
    },
    include: {
      model: User,
      required: false,
      where: {
        synchronization: false,
        zilAddress: {
          [Op.not]: null
        },
        lastAction: {
          [Op.lte]: blocksForClaim
        },
        status: new User().statuses.enabled
      },
      attributes: [
        'zilAddress',
        'profileId',
        'id'
      ]
    },
    attributes: [
      'id',
      'idStr',
      'text',
      'UserId'
    ]
  });

  if (!tweets || tweets.length === 0) {
    log.info('tx:handler no found tasks.');
  }

  tweets = _.filter(tweets, (tweet) => Boolean(tweet.User && tweet.idStr));
  tweets = _.uniqBy(tweets, 'idStr');
  tweets = _.uniqBy(tweets, 'UserId');

  const arrayChunk = _.chunk(tweets, TWEETS_IN_QUEUE);
  const tasks = arrayChunk.map((chunk) => {
    try {
      const payload = chunk.map((tweet) => ({
        tweetId: tweet.idStr,
        userId: tweet.User.profileId,
        zilAddress: tweet.User.zilAddress,
        tags: parseHashTags(tweet.text, blockchainInfo.hashtags),
        localUserId: tweet.User.id,
        localTweetId: tweet.id
      }));
      const ids = payload.map((t) => t.tweetId);

      return new Job(JOB_TYPES.verifyTweet, payload, ids);
    } catch (err) {
      log.error('task', JOB_TYPES.verifyTweet, err);

      return null;
    }
  }).filter(Boolean);

  return tasks;
}

async function queueFilling() {
  const admins = await Admin.findAll({
    where: {
      status: new Admin().statuses.enabled,
      balance: {
        [Op.gte]: MIN_AMOUNT
      },
      nonce: {
        [Op.lte]: 9000
      }
    },
    order: [
      ['nonce', 'ASC'],
      ['balance', 'DESC']
    ],
    attributes: [
      'bech32Address'
    ]
  });

  log.info(`${admins.length} admins will added to queue.`);

  const keys = admins.map((el) => el.bech32Address);
  const worker = new QueueWorker(keys);

  worker.jobQueues.forEach((jobQueue) => {
    jobQueue.on(jobQueue.events.trigger, async(task) => {
      await taskHandler(task, jobQueue);

      setTimeout(async () => {
        if (worker.jobsLength === 0 && !worker.padding) {
          const tasks = await getTasks();
          worker.distributeTasks(tasks);
          log.info(tasks.length, 'tasks added to queue', worker.jobsLength);
        }
      }, 200);
    });
  });

  const tasks = await getTasks();
  worker.distributeTasks(tasks);

  log.info(tasks.length, 'tasks added to queue');

  worker.redisSubscribe.on('message', async (channel, message) => {
    try {
      const body = JSON.parse(message);

      switch (body.type) {
        case JOB_TYPES.verifyTweet:
          // setTimeout(async () => {
          //   if (worker.jobsLength === 0 && !worker.padding) {
          //     const tasks = await getTasks();
          //     worker.distributeTasks(tasks);
          //     log.info(tasks.length, 'tasks added to queue', worker.jobsLength);
          //   }
          // }, 300);
          return null;
        case blockchain.tableName:
          // When blockchain has been updated.
          return null;
        default:
          return null;
      }
    } catch (err) {
      log.error('channel:', channel, 'message', message, 'error', err);
    }
  });
}

zilliqa
  .generateAddresses(process.env.NUMBER_OF_ADMINS)
  .then((accounts) => {
    accounts.forEach((account, index) => {
      const address = account.bech32Address;
      const balance = zilliqa.fromZil(account.balance);
      const minBalance = zilliqa.fromZil(MIN_AMOUNT);

      log.warn(`admin ${index}: ${address}, balance: ${balance}, min balance for use: ${minBalance} status: ${account.status}`);
    });

    return queueFilling();
  })
  .catch((err) => {
    log.error('queueFilling', err);

    const interval = setInterval(() => {
      queueFilling()
        .then(() => clearInterval(interval))
        .catch((e) => {
          log.error('queueFilling', e);

          return zilliqa.generateAddresses(process.env.NUMBER_OF_ADMINS)
        })
        .then((accounts) => {
          accounts.forEach((account, index) => {
            const address = account.bech32Address;
            const balance = zilliqa.fromZil(account.balance);

            log.warn(`admin ${index}: ${address}, balance: ${balance}, status: ${account.status}`);
          });
          require('../scheduler/admin')();
        })
      .catch((err) => null)
    }, 5000);
  });
