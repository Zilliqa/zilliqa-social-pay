const debug = require('debug')('zilliqa-social-pay:scheduler:Pedding-VerifyTweet');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {
  User,
  Twittes,
  blockchain,
  Notification
} = models.sequelize.models;

const notificationTypes = new Notification().types;

module.exports = async function () {
  const twittes = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      claimed: true,
      updatedAt: {
        [Op.lt]: new Date(new Date() - 24 * 60 * 50)
      },
      txId: {
        [Op.not]: null
      }
    },
    include: {
      model: User
    },
    limit: 10
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
      debug('FAIL to VerifyTweet with ID:', tweetId, 'hash', tweet.txId);

      await tweet.update({
        approved: false,
        rejected: false,
        claimed: false,
        block: 0,
        txId: null
      });
      await Notification.create({
        UserId: tweet.User.id,
        type: notificationTypes.tweetReject,
        title: 'Tweet',
        description: 'Rewards error!'
      });

      return null;
    }

    debug(`Tweet with ID:${tweetId} has been synchronized from blockchain.`);

    await tweet.update({
      approved: true,
      rejected: false,
      block: Number(blockchainInfo.BlockNum)
    });
    await Notification.create({
      UserId: tweet.User.id,
      type: notificationTypes.tweetClaimed,
      title: 'Tweet',
      description: 'Rewards claimed!'
    });
  });

  await Promise.all(needTestForVerified);
}
