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
      status: statuses.enabled
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
      },
      lastAction: {
        [Op.lte]: Number(blockchainInfo.DSBlockNum)
      }
    },
    include: {
      model: Twittes,
      where: {
        approved: false,
        rejected: false,
        txId: null
      },
      // limit: 1
    },
    limit: freeAdmins - 1
  });

  console.log(JSON.stringify(usersTweets, null, 4));

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
      await user.update({
        lastAction: Number(blockchainInfo.DSBlockNum) + Number(blockchainInfo.blocksPerWeek)
      });
      await tweet.update({ txId: tx.TranID });
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
