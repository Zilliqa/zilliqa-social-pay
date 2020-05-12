const bunyan = require('bunyan');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {
  User,
  Twittes,
  blockchain,
  Admin,
  Notification
} = models.sequelize.models;

const notificationTypes = new Notification().types;
const log = bunyan.createLogger({ name: 'scheduler:verifytweet' });

function getPos(text, hashtag) {
  text = encodeURI(text.toLowerCase());
  hashtag = hashtag.toLowerCase();

  const startIndex = text.indexOf(hashtag);

  if (startIndex < 0) {
    throw new Error('Danger tweet.');
  }

  text = text.slice(0, startIndex + hashtag.length);

  return {
    startIndex,
    text
  };
}

module.exports = async function () {
  const statuses = new Admin().statuses;
  const freeAdmins = await Admin.count({
    where: {
      status: statuses.enabled,
      balance: {
        [Op.gte]: '5000000000000' // 5ZILs
      }
    }
  });
  log.info('Free admin addresses:', freeAdmins);

  if (freeAdmins === 0) {
    return null;
  }

  let limit = Math.round(freeAdmins / 2) - 1;

  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const tweets = await Twittes.findAndCountAll({
    limit,
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
      }
    }
  });

  log.info('Need verify', tweets.count, 'tweet');

  tweets.rows.forEach(async (tweet) => {
    if (!tweet.User) {
      log.warn('Tweet with id', tweet.idStr, 'skiped');

      return null;
    }

    try {
      const registered = await zilliqa.getVerifiedTweets([tweet.idStr]);

      if (registered && registered[tweet.idStr]) {
        await tweet.update({
          approved: true,
          claimed: true,
          rejected: false,
          block: 0
        });
        await Notification.create({
          UserId: tweet.User.id,
          type: notificationTypes.tweetClaimed,
          title: 'Tweet',
          description: 'Rewards claimed!'
        });

        return null;
      }

      const { text, startIndex } = getPos(tweet.text, blockchainInfo.hashtag);
      const tx = await zilliqa.verifyTweet({
        profileId: tweet.User.profileId,
        tweetId: tweet.idStr,
        tweetText: text,
        startPos: startIndex
      });
      await tweet.update({
        txId: tx.TranID,
        block: Number(blockchainInfo.BlockNum)
      });

      log.info('Tweet with ID', tweet.idStr, 'sent to shard.');
    } catch (err) {
      if (err.message === 'Danger tweet.') {
        await tweet.destroy();
      }

      log.error('tweet:', tweet.idStr, 'has not verifed error:', err);

      await Notification.create({
        UserId: tweet.User.id,
        type: notificationTypes.tweetReject,
        title: 'Tweet',
        description: 'Claiming error!'
      });
    }
  });
}
