const bunyan = require('bunyan');
const zilliqa = require('../zilliqa');
const models = require('../models');
const eventUtils = require('../event-utils');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];

const { blockchain } = models.sequelize.models;
const log = bunyan.createLogger({ name: 'scheduler:socket' });

module.exports = async function (redisClient) {
  try {
    await zilliqa.blockSubscribe(async (newBlock) => {
      const currenInfo = await blockchain.findOne({
        where: { contract: CONTRACT_ADDRESS }
      });

      if (!currenInfo) {
        return null;
      }

      let defualtRate = 60000;
      const { balance } = await zilliqa.getCurrentAccount(CONTRACT_ADDRESS);
      const calcRate = new Date().valueOf() - new Date(currenInfo.updatedAt).valueOf();

      if (calcRate > defualtRate) {
        defualtRate = calcRate;
      }

      await currenInfo.update({
        ...newBlock,
        balance,
        rate: defualtRate
      });

      const payload = JSON.stringify({
        model: blockchain.tableName,
        body: currenInfo
      });
      redisClient.publish(REDIS_CONFIG.channels.WEB, payload);
      redisClient.set(blockchain.tableName, JSON.stringify(currenInfo));

      log.info('next block has been created, block:', newBlock.BlockNum);
    })
  } catch (err) {
    log.error('ERROR blockchain socket connection:', err);
  }

  try {
    await zilliqa.eventSubscribe(async (event) => {
      const { _eventname, params } = event;

      if (!params || !_eventname) {
        return null;
      }

      log.info('Event ', _eventname, 'has been emited');

      try {
        switch (_eventname) {
          case eventUtils.events.DeletedAdmin:
            const disabledAdmin = await eventUtils.deletedAdmin(params);
            log.info('Admin has been disabled', disabledAdmin);
            break;

          case eventUtils.events.AddedAdmin:
            const addedAdmin = await eventUtils.addedAdmin(params, redisClient);
            log.info('Admin has been added', addedAdmin);
            break;

          case eventUtils.events.ConfiguredUserAddress:
            const userProfileId = await eventUtils.configuredUserAddress(params, redisClient);
            log.info('User address has been updated, profileID', userProfileId);
            break;

          case eventUtils.events.VerifyTweetSuccessful:
            const tweetID = await eventUtils.verifyTweetSuccessful(params, redisClient);
            log.info('Tweet with id:', tweetID, 'has been verified.');
            break;

          case eventUtils.events.DepositSuccessful:
            await eventUtils.depositSuccessful(params);
            log.info('depositSuccessful');
            break;

          case eventUtils.events.Error:
            log.error('Error:', JSON.stringify(params, null, 4));
            break;

          default:
            log.warn('unknown event:', _eventname);
            break;
        }
      } catch (err) {
        log.error('Event ', _eventname, 'ERROR', err, 'event:', JSON.stringify(event, null, 4));
      }
    });
  } catch (err) {
    log.error('ERROR contract losg socket connection:', err);
  }
}
