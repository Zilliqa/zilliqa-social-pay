const debug = require('debug')('zilliqa-social-pay:stress-test');
const uuids = require('uuid');
const { Op } = require('sequelize');
const models = require('./models');
const { getAddressFromPrivateKey, schnorr, toBech32Address } = require('@zilliqa-js/crypto');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const { User, Twittes, blockchain } = models.sequelize.models;

const USERS_CREATER = 50000;
const USER_TO_CONFIGURE = 1000;
const TWEET_CREATER = 10000;

module.exports = function () {
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
      },
      limit: 100
    });

    users.forEach(async (user) => {
      const privateKey = schnorr.generatePrivateKey();
      const address = getAddressFromPrivateKey(privateKey);
      const bech32Address = toBech32Address(address);

      await user.update({
        synchronization: true,
        zilAddress: bech32Address
      });
    });
  }, USER_TO_CONFIGURE);

  setInterval(async () => {
    const users = await User.findAll({
      attributes: [
        'id'
      ]
    });

    users.forEach(async (user) => {
      await Twittes.create({
        idStr: uuids.v4(),
        text: `#Zilliqa ${uuids.v4()}`,
        UserId: user.id
      });
    });
  }, TWEET_CREATER);

  setInterval(async () => {
    const tweets = await Twittes.findAll({
      where: {
        approved: false,
        rejected: false,
        txId: null,
        claimed: false
      },
      includes: {
        model: User,
        where: {
          synchronization: false,
          zilAddress: {
            [Op.not]: null
          },
          hash: {
            [Op.not]: null
          },
          status: new User().statuses.enabled
        },
      },
      limit: 100
    });

    tweets.forEach(async (tweet) => {
      await tweet.update({
        claimed: true
      });
    });
  }, TWEET_CREATER);
}
