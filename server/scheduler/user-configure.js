const bunyan = require('bunyan');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');
const { toBech32Address } = require('@zilliqa-js/crypto');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {
  User,
  blockchain,
  Admin,
  Notification
} = models.sequelize.models;

const { actions } = new User();
const notificationTypes = new Notification().types;
const log = bunyan.createLogger({ name: 'scheduler:user-configure' });

module.exports = async function () {
  const statuses = new Admin().statuses;
  const freeAdmins = await Admin.count({
    where: {
      status: statuses.enabled,
      balance: {
        [Op.gte]: '5000000000000' // 5ZILs
      }
    }
  });

  log.info('Free admin addresses:', freeAdmins);

  if (freeAdmins === 0) {
    return null;
  }

  let limit = Math.round(freeAdmins / 2) - 1;

  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const users = await User.findAndCountAll({
    limit,
    where: {
      synchronization: true,
      zilAddress: {
        [Op.not]: null
      },
      lastAction: {
        [Op.lte]: Number(blockchainInfo.BlockNum)
      },
      hash: null,
      status: new User().statuses.enabled
    }
  });

  log.info('Need synchronization users:', users.count);

  if (users.count < 1) {
    return null;
  }

  for (let index = 0; index < users.rows.length; index++) {
    const user = users.rows[index];
    // Need to optimize.
    try {
      log.info('try to configureUser with profileID:', user.profileId);

      const tx = await zilliqa.configureUsers(user.profileId, user.zilAddress);
      const userExist = await zilliqa.getonfigureUsers([user.profileId]);
      let currentBlock = 0;

      if (userExist) {
        currentBlock = Number(blockchainInfo.BlockNum);
      }

      await user.update({
        hash: tx.TranID,
        lastAction: currentBlock,
        actionName: actions.configureUsers
      });

      log.info('User with profileID:', user.profileId, 'tx sent to shard.');
    } catch (err) {
      log.error('FAIL to configureUser with profileID:', user.profileId, 'error', err);

      const lastAddres = await zilliqa.getonfigureUsers([user.profileId]);

      if (!lastAddres || !lastAddres[user.profileId]) {
        await user.update({
          synchronization: false,
          zilAddress: null,
          lastAction: 0
        });
      } else {
        await user.update({
          synchronization: false,
          lastAction: Number(blockchainInfo.BlockNum),
          zilAddress: toBech32Address(lastAddres[user.profileId])
        });
      }

      await Notification.create({
        UserId: user.id,
        type: notificationTypes.addressReject,
        title: 'Account',
        description: 'synchronize error!'
      });
    }
  }
}
