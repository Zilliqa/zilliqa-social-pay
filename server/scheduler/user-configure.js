const debug = require('debug')('zilliqa-social-pay:scheduler:user-configure');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const User = models.sequelize.models.User;
const Admin = models.sequelize.models.Admin;
const Blockchain = models.sequelize.models.blockchain;

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
  const users = await User.findAndCountAll({
    where: {
      synchronization: true,
      zilAddress: {
        [Op.not]: null
      },
      lastAction: {
        [Op.lte]: Number(blockchainInfo.BlockNum)
      },
      hash: null
    },
    limit: 3
  });

  debug('Need synchronization users:', users.count);

  if (users.count < 1) {
    return null;
  }

  for (let index = 0; index < users.rows.length; index++) {
    const user = users.rows[index];

    try {
      debug('try to configureUser with profileID:', user.profileId);
      const tx = await zilliqa.configureUsers(user.profileId, user.zilAddress);
      const userExist = await zilliqa.getonfigureUsers([user.profileId]);
      let nextAction = 0;

      if (userExist) {
        nextAction = Number(blockchainInfo.BlockNum) + Number(blockchainInfo.blocksPerWeek);
      }

      await user.update({
        hash: tx.TranID,
        lastAction: nextAction
      });
      debug('User with profileID:', user.profileId, 'tx sent to shard.');
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
