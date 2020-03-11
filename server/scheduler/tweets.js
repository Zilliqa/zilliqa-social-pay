const debug = require('debug')('zilliqa-social-pay:scheduler');
const { units, BN } = require('@zilliqa-js/util');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const Twittes = models.sequelize.models.Twittes;
const User = models.sequelize.models.User;

module.exports = async function() {
  const twittes = await Twittes.findAndCountAll({
    where: {
      approved: false,
      txId: null
    },
    include: {
      model: User
    },
    limit: 10
  });
  const { balance, nonce, address } = await zilliqa.getCurrentAccount();
  const balanceAmount = units.fromQa(new BN(balance), units.Units.Zil)

  debug(`account: ${address}, balance: ${balanceAmount}, nonce: ${nonce}`);
  debug(`need to VerifyTweet ${twittes.count}`);

  // await zilliqa.verifyTweet({
  //   profileId: '',
  //   tweetId: '',
  //   tweetText: '',
  //   startPos: ''
  // }, nonce);
}
