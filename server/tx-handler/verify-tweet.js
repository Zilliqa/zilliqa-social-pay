const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'tx-handler:verify-tweet' });
const { promisify } = require('util');
const zilliqa = require('../zilliqa');
const { Op } = require('sequelize');
const models = require('../models');

const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];
const {
  User,
  Twittes,
  blockchain,
  Notification
} = models.sequelize.models;
const notificationTypes = new Notification().types;
const dangerTweet = 'Danger tweet.';

module.exports = async function (task, admin, redisClient) {
  const getAsync = promisify(redisClient.get).bind(redisClient);
  const blockchainInfo = JSON.parse(await getAsync(blockchain.tableName));
  const filtredTask = [];

  for (let index = 0; index < task.payload.length; index++) {
    const argElement = task.payload[index];
    const registered = await zilliqa.getVerifiedTweets([argElement.tweetId]);

    if (registered && registered[argElement.tweetId]) {
      await Twittes.update({
        approved: true,
        claimed: true,
        rejected: false
      }, {
        where: {
          id: argElement.localTweetId
        }
      });
      const notification = await Notification.create({
        UserId: argElement.localUserId,
        type: notificationTypes.tweetClaimed,
        title: 'Tweet',
        description: 'Rewards claimed!'
      });
      redisClient.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
        model: Notification.tableName,
        body: notification
      }));
      continue;
    } else {
      filtredTask.push(argElement);
    }
  }

  if (filtredTask.length === 0) {
    log.info('verify-tweet not found tasks');
    return null;
  }

  try {
    const tx = await zilliqa.verifyTweet(filtredTask, admin);

    log.info(
      'tx:handler:verify-tweet',
      'sent to shard txID:',
      tx.TranID
    );

    await Twittes.update({
      txId: tx.TranID,
      block: Number(blockchainInfo.BlockNum)
    }, {
      where: {
        [Op.and]: filtredTask.map((arg) => ({
          id: arg.localTweetId
        }))
      }
    });
    await User.update({
      lastAction: Number(blockchainInfo.BlockNum)
    }, {
      where: {
        [Op.and]: filtredTask.map((arg) => ({
          id: arg.localUserId
        }))
      }
    });

    filtredTask.forEach((arg) => {
      redisClient.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
        body: {
          id: arg.localTweetId
        },
        model: Twittes.tableName
      }));
    });
  } catch (err) {
    log.error('error', err);

    throw new Error(err);
  }
}
