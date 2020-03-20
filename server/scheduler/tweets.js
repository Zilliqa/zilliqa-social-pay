const debug = require('debug')('zilliqa-social-pay:scheduler:VerifyTweet');
const { units, BN } = require('@zilliqa-js/util');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const Twittes = models.sequelize.models.Twittes;
const Blockchain = models.sequelize.models.blockchain;
const User = models.sequelize.models.User;
const Admin = models.sequelize.models.Admin;

function getPos(text, hashtag) {
  text = text.toLowerCase();
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

  const twittes = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      txId: null
    },
    include: {
      model: User
    },
    limit: 10
  });
  const blockchainInfo = await Blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  debug(`need to VerifyTweet ${twittes.count}`);

  for (let index = 0; index < twittes.rows.length; index++) {
    const tweet = twittes.rows[index];

    if (!tweet.User.zilAddress || tweet.User.synchronization) {
      debug(`user with id: ${tweet.User.id}, has skipped`);
      continue;
    }

    try {
      const { text, startIndex } = getPos(tweet.text, blockchainInfo.hashtag);
      const tx = await zilliqa.verifyTweet({
        profileId: tweet.User.profileId,
        tweetId: tweet.idStr,
        tweetText: text,
        startPos: startIndex
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
  }
}
