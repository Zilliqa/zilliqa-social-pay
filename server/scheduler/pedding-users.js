const debug = require('debug')('zilliqa-social-pay:scheduler:peddign-users');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

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
