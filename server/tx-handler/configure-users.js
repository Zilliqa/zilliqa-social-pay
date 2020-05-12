const { toBech32Address } = require('@zilliqa-js/crypto');
const zilliqa = require('../zilliqa');
const { Op } = require('sequelize');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const {
  User,
  blockchain,
  Notification
} = models.sequelize.models;

module.exports = async function (task, admin) {
  let currentBlock = 0;
  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const user = await User.findOne({
    where: {
      id: task.payload.userId,
      synchronization: true,
      zilAddress: {
        [Op.not]: null
      },
      hash: null,
      status: new User().statuses.enabled
    }
  });

  if (!user) {
    return null;
  } else if (Number(user.lastAction) > Number(blockchainInfo.BlockNum)) {
    throw new Error(
      `Current blockNumber ${blockchainInfo.BlockNum} but user lastAction ${user.lastAction}`
    );
  }

  const userExist = await zilliqa.getonfigureUsers([user.profileId]);

  if (userExist) {
    currentBlock = Number(blockchainInfo.BlockNum);
  }

  try {
    const tx = await zilliqa.configureUsers(
      user.profileId,
      user.zilAddress,
      admin
    );

    await user.update({
      hash: tx.TranID,
      lastAction: currentBlock,
      actionName: new User().actions.configureUsers
    });
  } catch (err) {
    const lastAddres = await zilliqa.getonfigureUsers([user.profileId]);

    if (lastAddres && lastAddres[user.profileId]) {
      await user.update({
        synchronization: false,
        lastAction: Number(blockchainInfo.BlockNum),
        zilAddress: toBech32Address(lastAddres[user.profileId])
      });
    }

    throw new Error(err);
  }
}
