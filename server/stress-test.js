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

const USERS_CREATER = 5000;
const TWEET_CREATER = 5000;

module.exports = function test() {
  setInterval(async () => {
    try {
      const privateKey = schnorr.generatePrivateKey();
      const address = getAddressFromPrivateKey(privateKey);
      const bech32Address = toBech32Address(address);
      const user = await User.create({
        username: `test${uuids.v4()}`,
        profileId: uuids.v4(),
        screenName: `test${uuids.v4()}`,
        profileImageUrl: uuids.v4(),
        synchronization: false,
        zilAddress: bech32Address
      });

      redisClientSender.publish(REDIS_CONFIG.channels.TX_HANDLER, JSON.stringify({
        type: JOB_TYPES.configureUsers,
        userId: user.id
      }));
    } catch (err) {
      console.error('CREATE User', 'ERROR', err);
    }
  }, USERS_CREATER);

  setInterval(async () => {
    try {
      const users = await User.findAll({
        where: {
          synchronization: false,
          zilAddress: {
            [Op.not]: null
          }
        },
        attributes: [
          'id'
        ],
        limit: 1000
      });

      users.forEach(async (user) => {
        const tweetCount = await Twittes.count({
          where: {
            UserId: user.id
          }
        });

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
    } catch (err) {
      console.error('CREATE TWEET', 'ERROR', err);
    }
  }, TWEET_CREATER);
}
