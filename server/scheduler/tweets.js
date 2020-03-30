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
const actions = new User().actions;

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

  if (freeAdmins === 0) {
    return null;
  }
  const blockchainInfo = await Blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const usersTweets = await User.findAndCountAll({
    where: {
      synchronization: false,
      zilAddress: {
        [Op.not]: null
      }
    },
    include: {
      model: Twittes,
      where: {
        approved: false,
        rejected: false,
        txId: null
      },
      limit: 1
    },
    attributes: [
      'id',
      'profileId'
    ],
    limit: freeAdmins
  });

  debug('Need update tweet for', usersTweets.count, 'users.');

  usersTweets.rows.forEach(async (user) => {
    const tweet = user.Twittes[0];

    if (!tweet) {
      debug('User have not any tweets');
      return null;
    }

    try {
      const { text, startIndex } = getPos(tweet.text, blockchainInfo.hashtag);
      const tx = await zilliqa.verifyTweet({
        profileId: user.profileId,
        tweetId: tweet.idStr,
        tweetText: text,
        startPos: startIndex
      });
      await tweet.update({
        txId: tx.TranID,
        block: Number(blockchainInfo.BlockNum)
      });
      debug('Tweet with ID:', tweet.idStr, 'sent to shard for verify.');
    } catch (err) {
      await tweet.update({
        txId: null,
        approved: false,
        rejected: false
      });
      debug('tweet:', tweet.idStr, 'has not verifed error:', err);
    }
  });
}
