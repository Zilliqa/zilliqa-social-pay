const debug = require('debug')('zilliqa-social-pay:scheduler:Pedding-VerifyTweet');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {
  User,
  Twittes,
  Blockchain
} = models.sequelize.models;

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

  const blockchainInfo = await Blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const needTestForVerified = twittes.rows.map(async (tweet) => {
    const tweetId = tweet.idStr;
    const hasInContract = await zilliqa.getVerifiedTweets([tweetId]);

    if (!hasInContract || !hasInContract[tweetId]) {
      debug('FAIL to VerifyTweet with ID:', tweetId, 'hash', tweet.txId);

      return await tweet.update({
        approved: false,
        rejected: false,
        claimed: false,
        block: 0,
        txId: null
      });
    }

    debug(`Tweet with ID:${tweetId} has been synchronized from blockchain.`);
    return tweet.update({
      approved: true,
      rejected: false,
      block: Number(blockchainInfo.BlockNum)
    });
  });

  await Promise.all(needTestForVerified);
}
