const debug = require('debug')('zilliqa-social-pay:scheduler:VerifyTweet');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {
  User,
  Twittes,
  Blockchain,
  Admin
} = models.sequelize.models;

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

  debug('Free admin addresses:', freeAdmins);

  if (freeAdmins === 0) {
    return null;
  }

  const blockchainInfo = await Blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
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
      }
    },
    limit: freeAdmins
  });

  debug('Need verify', tweets.count, 'tweet');

  tweets.rows.forEach(async (tweet) => {
    if (!tweet.User) {
      debug('Tweet with id', tweet.idStr, 'skiped');

      return null;
    }

    try {
      const registered = await zilliqa.getVerifiedTweets([tweet.idStr]);

      if (registered && registered[tweet.idStr]) {
        return await tweet.update({
          approved: true,
          claimed: true,
          rejected: false,
          block: 0
        });
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
      debug('Tweet with ID', tweet.idStr, 'sent to shard.');
    } catch (err) {
      if (err.message === 'Danger tweet.') {
        await tweet.destroy();
      }

      debug('tweet:', tweet.idStr, 'has not verifed error:', err);
    }
  });
}
