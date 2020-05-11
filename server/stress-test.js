const uuids = require('uuid');
const { Op } = require('sequelize');
const models = require('./models');
const { getAddressFromPrivateKey, schnorr, toBech32Address } = require('@zilliqa-js/crypto');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const { User, Twittes, blockchain } = models.sequelize.models;

const USERS_CREATER = 5000;
const USER_TO_CONFIGURE = 5000;
const TWEET_CREATER = 5000;

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
    });
  }, USER_TO_CONFIGURE);

  setInterval(async () => {
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
          rejected: false
        }
      });

      if (tweetCount > 0) {
        return null;
      }

      await Twittes.create({
        idStr: uuids.v4(),
        text: `#Zilliqa ${uuids.v4()}`,
        UserId: user.id,
        claimed: true
      });
    });
  }, TWEET_CREATER);
}
