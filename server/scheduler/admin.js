const bunyan = require('bunyan');
const { toBech32Address } = require('@zilliqa-js/crypto');
const zilliqa = require('../zilliqa');
const models = require('../models');

const { Admin } = models.sequelize.models;
const log = bunyan.createLogger({ name: 'scheduler:admins' });
const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];

module.exports = async function (redisClient) {
  const statuses = new Admin().statuses;
  const adminsDB = await Admin.findAll({
    where: {
      status: statuses.disabled
    },
    attributes: [
      'address'
    ]
  });
  const admins = await zilliqa.getAdmins();
  const needUpdate = admins.map(async (adminAddress) => {
    const { balance, nonce } = await zilliqa.getCurrentAccount(adminAddress);
    const willUpdate = adminsDB.some((account) => adminAddress === account.address);

    if (willUpdate) {
      redisClient.publish(REDIS_CONFIG.channels.TX_HANDLER, JSON.stringify({
        type: Admin.tableName,
        address: toBech32Address(adminAddress)
      }));
    }

    return Admin.update({
      balance,
      nonce,
      status: statuses.enabled
    }, {
      where: {
        address: adminAddress
      }
    });
  });

  const updated = await Promise.all(needUpdate);

  log.info('Admins updated:', updated.length, 'admin accounts.');
}
