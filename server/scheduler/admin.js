const debug = require('debug')('zilliqa-social-pay:scheduler');
const zilliqa = require('../zilliqa');
const models = require('../models');

const Admin = models.sequelize.models.Admin;

module.exports = async function() {
  const statuses = new Admin().statuses;
  const accounts = await Admin.findAndCountAll({
    where: {
      status: statuses.enabled,
      updatedAt: {
        // A day.
        [Op.lt]: new Date(new Date() - 24 * 60 * 60)
      }
      // inProgress: false
    }
  });

  try {
    debug(`need update ${accounts.count} accounts`);

    const updatedAccounts = accounts.rows.map(async (acc) => {
      const { nonce, balance } = await zilliqa.getCurrentAccount(acc.address);

      return acc.update({
        nonce,
        balance,
        inProgress: false
      });
    });

    await Promise.all(updatedAccounts);

    debug('Accounts has been updated.');
  } catch (err) {
    console.log(err);
    debug('update accounts error:', err);
  }
}
