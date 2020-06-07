require('dotenv').config();

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
const AMOUNT_OF_TASKS = 500;

if (!validation.isBech32(CONTRACT_ADDRESS)) {
  throw new Error('incorect contract address');
}

const { User, Twittes, Admin, blockchain } = models.sequelize.models;
const redisSender = redis.createClient(REDIS_CONFIG.url);
const getAsync = promisify(redisSender.get).bind(redisSender);

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield (arr.slice(i, i + n));
  }
}

function parseHashTags(text, hashTag) {
  hashTag = hashTag.toLowerCase();
  text = text.toLowerCase();

  const re = new RegExp(`(${hashTag})`, 'g');
  let m = null;

  do {
    m = re.exec(text);
    if (m) return Array.from(new Set(m.filter(Boolean)));
  } while (m);

  return [];
}

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

    default:
      jobQueue.taskDone(task);
      break;
  }
}

async function getTasks() {
  const blockchainInfo = JSON.parse(await getAsync(blockchain.tableName));

  if (!blockchainInfo) {
    throw new Error('NEXT');
  }

  const blocksForClaim = Number(blockchainInfo.BlockNum) - (Number(blockchainInfo.blocksPerDay));
  const tweets = await Twittes.findAndCountAll({
    limit: TWEETS_IN_QUEUE * AMOUNT_OF_TASKS,
    where: {
      approved: false,
      rejected: false,
      txId: null,
      claimed: true,
      block: {
        [Op.lt]: blocksForClaim
      }
    },
    include: {
      model: User,
      where: {
        synchronization: false,
        zilAddress: {
          [Op.not]: null
        },
        lastAction: {
          [Op.lt]: blocksForClaim
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
      'idStr',
      'text'
    ]
  });
  const arrayChunk = chunks(tweets.rows, TWEETS_IN_QUEUE);
  const tasks = Array.from(arrayChunk).map((chunk) => {
    try {
      const payload = chunk.map((tweet) => ({
        tweetId: tweet.idStr,
        userId: tweet.User.profileId,
        zilAddress: tweet.User.zilAddress,
        tags: parseHashTags(tweet.text, blockchainInfo.hashtag),
        localUserId: tweet.User.id
      }));

      return new Job(JOB_TYPES.verifyTweet, payload);
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
    jobQueue.on(jobQueue.events.trigger, (task) => taskHandler(task, jobQueue));
  });
  const tasks = await getTasks();

  worker.distributeTasks(tasks);

  log.info(tasks.length, 'tasks added to queue');
  worker.redisSubscribe.on('message', async (channel, message) => {
    try {
      const body = JSON.parse(message);

      switch (body.type) {
        case Admin.tableName:
          const newJob = worker.addJobQueues(body.address);
          newJob.addListener(newJob.events.trigger, (task) => taskHandler(task, newJob));
          log.info('Added new job admin:', body.address);
          return null;
        case blockchain.tableName:
          const tasks = await getTasks();
          worker.distributeTasks(tasks);
          log.info(tasks.length, 'tasks added to queue');
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
