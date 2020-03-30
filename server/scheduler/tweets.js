const debug = require('debug')('zilliqa-social-pay:scheduler:VerifyTweet');
const { units, BN } = require('@zilliqa-js/util');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const Twittes = models.sequelize.models.Twittes;
const Blockchain = models.sequelize.models.blockchain;
const User = models.sequelize.models.User;
const Admin = models.sequelize.models.Admin;

function getPos(text, hashtag) {
  text = encodeURI(text.toLowerCase());
  hashtag = hashtag.toLowerCase();

  let startIndex = text.indexOf(hashtag);

  return {
    startIndex,
    text: text.slice(0, startIndex + hashtag.length)
  };
}

module.exports = async function() {
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

  if (freeAdmins === 0 || freeAdmins < 3) {
    return null;
  }

  const blockchainInfo = await Blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const tweets = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      txId: null
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

  debug('Need update tweet', tweets.count);

  tweets.rows.forEach(async (tweet) => {
    if (!tweet.User) {
      debug('Tweet with id', tweet.idStr, 'skiped');

      return null;
    }

    try {
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
      debug('tweet:', tweet.idStr, 'has not verifed error:', err);
    }
  });
}
