const bunyan = require('bunyan');
const zilliqa = require('../zilliqa');
const models = require('../models');

const { Admin } = models.sequelize.models;
const log = bunyan.createLogger({ name: 'scheduler:admins' });

module.exports = async function () {
  const statuses = new Admin().statuses;
  const admins = await zilliqa.getAdmins();
  const needUpdate = admins.map(async (adminAddress) => {
    const { balance } = await zilliqa.getCurrentAccount(adminAddress);

    return Admin.update({
      balance,
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
