const debug = require('debug')('zilliqa-social-pay:scheduler:admins');
const { Op } = require('sequelize');
const zilliqa = require('../zilliqa');
const models = require('../models');

const Admin = models.sequelize.models.Admin;

module.exports = async function() {
  const statuses = new Admin().statuses;
  const admins = await zilliqa.getAdmins();
  const needUpdate = admins.map(async (adminAddress) => {
    const {
      balance
    } = await zilliqa.getCurrentAccount(adminAddress);

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

  debug('Admins updated:', updated.length, 'admin accounts.');
}
