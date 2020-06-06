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

  try {
    const tx = await zilliqa.verifyTweet(task.payload, admin);

    log.info(
      'Tweet: ',
      task.payload.map((t) => t.tweetId),
      'sent to shard txID:',
      tx.TranID
    );

  } catch (err) {
    log.error('TweetID:', task.payload.map((t) => t.tweetId), 'error', err);

    // if (err.message === dangerTweet) {
    //   await tweet.destroy();
    //   const notification = await Notification.create({
    //     UserId: tweet.User.id,
    //     type: notificationTypes.tweetReject,
    //     title: 'Tweet',
    //     description: 'Danger tweet.'
    //   });
    //   redisClient.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
    //     model: Notification.tableName,
    //     body: notification
    //   }));

    //   throw new Error(err);
    // }

    // await tweet.update({
    //   block: lastWithdrawal
    // });

    throw new Error(err);
  }
}
