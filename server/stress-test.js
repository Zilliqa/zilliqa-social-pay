const uuids = require('uuid');
const { Op } = require('sequelize');
const redis = require('redis');
const models = require('./models');
const { getAddressFromPrivateKey, schnorr, toBech32Address } = require('@zilliqa-js/crypto');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const { User, Twittes, blockchain } = models.sequelize.models;
const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('./config/redis')[ENV];
const JOB_TYPES = require('./config/job-types');
const redisClientSender = redis.createClient(REDIS_CONFIG.url);

const USERS_CREATER = 1500;
const USER_TO_CONFIGURE = 1500;
const TWEET_CREATER = 1500;

function test() {
  setInterval(async() => {
    await User.create({
      username: `test${uuids.v4()}`,
      profileId: uuids.v4(),
      screenName: `test${uuids.v4()}`,
      profileImageUrl: uuids.v4()
    }).catch(console.log);
  }, USERS_CREATER);

  setInterval(async () => {
    const blockchainInfo = await blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });
    const users = await User.findAll({
      where: {
        synchronization: false,
        zilAddress: null,
        lastAction: {
          [Op.lte]: Number(blockchainInfo.BlockNum)
        },
        hash: null,
        status: new User().statuses.enabled
      }
    });

    users.forEach(async (user) => {
      const privateKey = schnorr.generatePrivateKey();
      const address = getAddressFromPrivateKey(privateKey);
      const bech32Address = toBech32Address(address);

      await user.update({
        synchronization: true,
        zilAddress: bech32Address
      });
      redisClientSender.publish(REDIS_CONFIG.channels.TX_HANDLER, JSON.stringify({
        type: JOB_TYPES.configureUsers,
        userId: user.id
      }));
    });
  }, USER_TO_CONFIGURE);

  setInterval(async () => {
    const blockchainInfo = await blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });
    const users = await User.findAll({
      where: {
        synchronization: false,
        zilAddress: {
          [Op.not]: null
        }
      },
      attributes: [
        'id'
      ]
    });

    users.forEach(async (user) => {
      const tweetCount = await Twittes.count({
        where: {
          UserId: user.id,
          approved: false,
          rejected: false,
          claimed: false,
          block: {
            [Op.lt]: Number(blockchainInfo.BlockNum) + 5
          }
        }
      });

      if (tweetCount > 0) {
        return null;
      }

      const tweet = await Twittes.create({
        idStr: uuids.v4(),
        text: `#Zilliqa ${uuids.v4()}`,
        UserId: user.id,
        claimed: true
      });
      
      const payload = JSON.stringify({
        type: JOB_TYPES.verifyTweet,
        tweetId: tweet.id,
        userId: user.id
      });
      redisClientSender.publish(REDIS_CONFIG.channels.TX_HANDLER, payload);
    });
  }, TWEET_CREATER);
}
test();