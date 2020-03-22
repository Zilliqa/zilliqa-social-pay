const debug = require('debug')('zilliqa-social-pay:scheduler:peddign-users');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const User = models.sequelize.models.User;

module.exports = async function() {
  const users = await User.findAndCountAll({
    where: {
      synchronization: true,
      zilAddress: {
        [Op.not]: null
      },
      updatedAt: {
        // Ten minuts.
        [Op.lt]: new Date(new Date() - 24 * 60 * 400)
      },
      hash: {
        [Op.not]: null
      }
    },
    limit: 100
  });

  debug('Need check', users.count, 'users.');

  if (users.count < 1) {
    return null;
  }

  for (let index = 0; index < users.rows.length; index++) {
    const user = users.rows[index];

    try {
      await zilliqa.getVerifiedUsers(user.hash);
    } catch (err) {
      debug('FAIL to configureUser with profileID:', user.profileId, 'error', err);
      await user.update({
        synchronization: false,
        zilAddress: null,
        lastAction: 0
      });
    }
  }
}
