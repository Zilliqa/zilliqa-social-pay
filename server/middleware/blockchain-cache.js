const { promisify } = require('util');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const END_OF_CAMPAIGN = process.env.END_OF_CAMPAIGN;

const { blockchain } = models.sequelize.models;

module.exports = async function (req, res, next) {
  const { redis } = req.app.settings;
  const getBlock = promisify(redis.get).bind(redis);
  let blockchainInfo = null;

  try {
    blockchainInfo = await getBlock(blockchain.tableName);

    if (!blockchainInfo) {
      throw new Error('not found from cahce.');
    }

    blockchainInfo = JSON.parse(blockchainInfo);
  } catch (err) {
    blockchainInfo = await blockchain.findOne({
      where: {
        contract: CONTRACT_ADDRESS
      },
      raw: true
    });

    blockchainInfo.campaignEnd = new Date(END_OF_CAMPAIGN);
    blockchainInfo.now = new Date();
  }

  req.blockchainInfo = blockchainInfo;

  next();
}
