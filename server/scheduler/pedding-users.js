const debug = require('debug')('zilliqa-social-pay:scheduler:peddign-users');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');
const { toBech32Address } = require('@zilliqa-js/crypto');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {
  User,
  blockchain
} = models.sequelize.models;

module.exports = async function () {
  const users = await User.findAndCountAll({
    where: {
      synchronization: true,
      zilAddress: {
        [Op.not]: null
      },
      updatedAt: {
        // Ten minuts.
        [Op.lt]: new Date(new Date() - 24 * 60 * 50)
      }
    },
    limit: 20
  });

  debug('Need check', users.count, 'users.');

  if (users.count < 1) {
    return null;
  }

  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const onlyProfiles = users.rows.map(async (user) => {
    const profileId = user.profileId;
    const usersFromContract = await zilliqa.getonfigureUsers([profileId]);

    if (!usersFromContract || !usersFromContract[profileId]) {
      debug('FAIL to configureUser with profileID:', profileId);

      return await user.update({
        synchronization: false,
        zilAddress: null,
        lastAction: 0
      });
    }

    debug('User with profileID:', profileId, 'has been synchronized from blockchain.');
    return await user.update({
      synchronization: false,
      zilAddress: toBech32Address(usersFromContract[profileId]),
      lastAction: 0
    });
  });

  await Promise.all(onlyProfiles);
}
