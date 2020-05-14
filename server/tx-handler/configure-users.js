const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'tx-handler:verify-tweet' });
const { toBech32Address } = require('@zilliqa-js/crypto');
const { promisify } = require('util');
const zilliqa = require('../zilliqa');
const { Op } = require('sequelize');
const models = require('../models');

const {
  User,
  blockchain
} = models.sequelize.models;

module.exports = async function (task, admin) {
  const getAsync = promisify(redisClient.get).bind(redisClient);
  const blockchainInfo = JSON.parse(await getAsync(blockchain.tableName));
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
  let currentBlock = 0;

  if (!user) {
    log.warn('no found userID', task.payload.userId);
    return null;
  } else if (Number(user.lastAction) > Number(blockchainInfo.BlockNum)) {
    const msg = `Current blockNumber ${blockchainInfo.BlockNum} but user lastAction ${user.lastAction}`;
    log.warn(msg);
    throw new Error(msg);
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

    log.info('userID:', task.payload.userId, 'send to shard txID:', tx.TranID);

    await user.update({
      hash: tx.TranID,
      lastAction: currentBlock,
      actionName: new User().actions.configureUsers
    });

    return user;
  } catch (err) {
    const lastAddres = await zilliqa.getonfigureUsers([user.profileId]);

    if (lastAddres && lastAddres[user.profileId]) {
      await user.update({
        synchronization: false,
        lastAction: Number(blockchainInfo.BlockNum),
        zilAddress: toBech32Address(lastAddres[user.profileId])
      });

      log.warn('UserID', user.id, 'to initial state', err);

      return user;
    }

    log.error('userID:', task.payload.userId, 'error', err);

    throw new Error(err);
  }
}
