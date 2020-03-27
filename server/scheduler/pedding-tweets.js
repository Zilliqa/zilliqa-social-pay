const debug = require('debug')('zilliqa-social-pay:scheduler:Pedding-VerifyTweet');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const Twittes = models.sequelize.models.Twittes;
const User = models.sequelize.models.User;
const Admin = models.sequelize.models.Admin;

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

  const twittes = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      updatedAt: {
        // Ten minuts.
        [Op.lt]: new Date(new Date() - 24 * 60 * 400)
      },
      txId: {
        [Op.not]: null
      }
    },
    include: {
      model: User
    },
    limit: 50
  });

  if (twittes.count === 0) {
    return null;
  }

  const needTestForVerified = twittes.rows.map(async (tweet) => {
    try {
      return await zilliqa.getVerifiedTweets(tweet.txId);
    } catch (err) {
      debug('FAIL to VerifyTweet with ID:', tweet.idStr, 'hash', tweet.txId, 'ERROR:', err);

      await Twittes.update({
        approved: false,
        rejected: true
      }, {
        where: { idStr: tweet.idStr }
      });

      return null
    }
  });
  let verifiedTweets = await Promise.all(needTestForVerified);

  verifiedTweets = verifiedTweets.filter(Boolean);

  debug(`Tweets ${verifiedTweets.length} has been updated.`);
}
