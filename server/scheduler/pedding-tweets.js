const bunyan = require('bunyan');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];

const {
  User,
  Twittes,
  blockchain,
  Notification
} = models.sequelize.models;
const log = bunyan.createLogger({ name: 'scheduler:pedding-verifytweet' });

const notificationTypes = new Notification().types;

module.exports = async function (redisClient) {
  const twittes = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      claimed: true,
      updatedAt: {
        [Op.lt]: new Date(new Date() - 24 * 60 * 150)
      },
      txId: {
        [Op.not]: null
      }
    },
    include: {
      model: User
    },
    limit: 500
  });

  if (twittes.count === 0) {
    return null;
  }

  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const needTestForVerified = twittes.rows.map(async (tweet) => {
    const tweetId = tweet.idStr;
    const hasInContract = await zilliqa.getVerifiedTweets([tweetId]);

    if (!hasInContract || !hasInContract[tweetId]) {
      log.warn('FAIL to VerifyTweet with ID:', tweetId, 'hash', tweet.txId);

      await tweet.update({
        approved: false,
        rejected: false,
        claimed: true,
        block: 0,
        txId: null
      });
      const notification = await Notification.create({
        UserId: tweet.User.id,
        type: notificationTypes.tweetReject,
        title: 'Tweet',
        description: 'Rewards error!'
      });

      redisClient.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
        model: Notification.tableName,
        body: notification
      }));

      return null;
    }

    log.info(`Tweet with ID:${tweetId} has been synchronized from blockchain.`);

    await tweet.update({
      approved: true,
      rejected: false,
      block: Number(blockchainInfo.BlockNum)
    });
    const notification = await Notification.create({
      UserId: tweet.User.id,
      type: notificationTypes.tweetClaimed,
      title: 'Tweet',
      description: 'Rewards claimed!'
    });

    redisClient.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
      model: Notification.tableName,
      body: notification
    }));
  });

  await Promise.all(needTestForVerified);
}
