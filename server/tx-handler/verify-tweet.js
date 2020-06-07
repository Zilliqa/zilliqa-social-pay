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
  const filtredTask = await Promise.all(task.payload.filter(async (arg) => {
    const blocksForClaim = Number(blockchainInfo.BlockNum) - (Number(blockchainInfo.blocksPerDay));
    const tweet = await Twittes.findOne({
      where: {
        idStr: arg.tweetId
      },
      txId: null,
      block: {
        [Op.lt]: blocksForClaim
      }
    });

    if (!tweet) {
      return false;
    }
    
    const lastWithdrawal = await zilliqa.getLastWithdrawal([arg.userId]);
    const lastBlockForClaim = Number(lastWithdrawal) + Number(blockchainInfo.blocksPerDay);

    if (lastBlockForClaim >= Number(blockchainInfo.BlockNum)) {
      return false;
    }

    const registered = await zilliqa.getVerifiedTweets([arg.tweetId]);

    if (registered && registered[arg.tweetId]) {
      await tweet.update({
        approved: true,
        claimed: true,
        rejected: false
      });
      const notification = await Notification.create({
        UserId: arg.localUserId,
        type: notificationTypes.tweetClaimed,
        title: 'Tweet',
        description: 'Rewards claimed!'
      });
      redisClient.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
        model: Notification.tableName,
        body: notification
      }));

      return false;
    }

    return true;
  }));

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
          idStr: arg.tweetId
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
  } catch (err) {
    log.error('error', err);

    throw new Error(err);
  }
}
