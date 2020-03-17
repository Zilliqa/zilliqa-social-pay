const debug = require('debug')('zilliqa-social-pay:scheduler');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const Twittes = models.sequelize.models.Twittes;
const User = models.sequelize.models.User;

module.exports = async function() {
  const twittes = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      updatedAt: {
        // A day.
        [Op.lt]: new Date(new Date() - 24 * 60 * 60 * 1000)
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
  const needTestForVerified = twittes.rows.map(
    (tweet) => zilliqa.getVerifiedTweets(tweet.idStr)
  );

  debug(`Need check ${twittes.count} Twittes.`);

  if (twittes.count === 0) {
    return null;
  }

  const verifiedTweets = await Promise.all(needTestForVerified);
  
  await Promise.all(verifiedTweets.map((tweet) => {
    if (tweet.verified_tweets) {
      return Twittes.update(
        {
          approved: true,
          rejected: false,
          txId: null
        },
        {
          where: {
            idStr: Object.keys(tweet.verified_tweets)[0]
          }
        }
      );
    }

    return Twittes.update(
      {
        approved: false,
        rejected: true,
        txId: null
      },
      {
        where: {
          idStr: tweet.not_verified_tweets
        }
      }
    );
  }));

  debug(`${verifiedTweets.length} Tweets has been updated.`);
}
