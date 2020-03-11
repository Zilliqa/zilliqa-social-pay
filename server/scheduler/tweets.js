const debug = require('debug')('zilliqa-social-pay:scheduler');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const Twittes = models.sequelize.models.Twittes;

module.exports = async function() {
  const twittes = await Twittes.findAndCountAll({
    where: {
      approved: false,
      txId: null
    },
    limit: 10
  });

  console.log(twittes);
}()
