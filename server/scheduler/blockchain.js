const debug = require('debug')('zilliqa-social-pay:scheduler:blockchain');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const { blockchain } = models.sequelize.models;

module.exports = async function () {
  try {
    const blockchainInfo = await zilliqa.blockchainInfo();
    const contractInfo = await zilliqa.getInit();
    const { balance } = await zilliqa.getCurrentAccount(CONTRACT_ADDRESS);

    let currenInfo = await blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });

    if (!currenInfo) {
      debug('cannot find to blockchain info. currenInfo:', currenInfo, 'contracta address', CONTRACT_ADDRESS);

      await blockchain.create({
        ...blockchainInfo,
        ...contractInfo,
        balance,
        rate: 60000,
        contract: CONTRACT_ADDRESS,
        BlockNum: blockchainInfo.NumTxBlocks,
        DSBlockNum: blockchainInfo.CurrentDSEpoch,
        initBalance: balance
      });

      currenInfo = await blockchain.findOne({
        where: { contract: CONTRACT_ADDRESS }
      });
    }
    let initBalance = currenInfo.initBalance;

    if (Number(initBalance) < Number(balance)) {
      initBalance = balance;
    }

    await currenInfo.update({
      ...blockchainInfo,
      ...contractInfo,
      balance,
      initBalance,
      BlockNum: blockchainInfo.NumTxBlocks,
      DSBlockNum: blockchainInfo.CurrentDSEpoch
    });

    debug('blockchain info has been updated.');
  } catch (err) {
    debug('update blockchain info error:', err);
  }
}
