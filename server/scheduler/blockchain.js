const bunyan = require('bunyan');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const END_OF_CAMPAIGN = process.env.END_OF_CAMPAIGN;
const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];

const { blockchain } = models.sequelize.models;
const log = bunyan.createLogger({ name: 'scheduler:blockchain' });

module.exports = async function (redisClient) {
  try {
    const blockchainInfo = await zilliqa.blockchainInfo();
    const contractInfo = await zilliqa.getInit();
    const { balance } = await zilliqa.getCurrentAccount(CONTRACT_ADDRESS);

    let currenInfo = await blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });

    if (!currenInfo) {
      log.warn('cannot find to blockchain info. currenInfo:', currenInfo, 'contracta address', CONTRACT_ADDRESS);

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

    currenInfo.dataValues.campaignEnd = new Date(END_OF_CAMPAIGN);
    currenInfo.dataValues.now = new Date();

    const payload = JSON.stringify({
      model: blockchain.tableName,
      body: currenInfo
    });
    redisClient.publish(REDIS_CONFIG.channels.WEB, payload);
    redisClient.publish(REDIS_CONFIG.channels.TX_HANDLER, JSON.stringify({
      type: blockchain.tableName,
      body: currenInfo
    }));
    redisClient.set(blockchain.tableName, JSON.stringify(currenInfo));

    log.info('blockchain info has been updated.');
  } catch (err) {
    log.error('update blockchain info error:', err);
  }
}
