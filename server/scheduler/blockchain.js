const debug = require('debug')('zilliqa-social-pay:scheduler');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const Blockchain = models.sequelize.models.blockchain;

module.exports = async function() {
  try {
    const blockchainInfo = await zilliqa.blockchainInfo();
    const contractInfo = await zilliqa.getInit();

    const currenInfo = await Blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });

    if (!currenInfo) {
      debug('cannot find to blockchain info.');

      return null;
    }

    await currenInfo.update({
      ...blockchainInfo,
      ...contractInfo
    });

    debug('blockchain info has been updated.');
  } catch (err) {
    debug('update blockchain info error:', err);
  }
}
