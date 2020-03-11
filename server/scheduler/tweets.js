const debug = require('debug')('zilliqa-social-pay:scheduler');
const { units, BN } = require('@zilliqa-js/util');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const Twittes = models.sequelize.models.Twittes;
const Blockchain = models.sequelize.models.blockchain;
const User = models.sequelize.models.User;

function getPos(text, hashtag) {
  text = text.toLowerCase();
  hashtag = hashtag.toLowerCase();

  return text.indexOf(hashtag) + 1;
}

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
  const blockchainInfo = await Blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const { balance, nonce, address } = await zilliqa.getCurrentAccount();
  const balanceAmount = units.fromQa(new BN(balance), units.Units.Zil)

  debug(`account: ${address}, balance: ${balanceAmount}, nonce: ${nonce}`);
  debug(`need to VerifyTweet ${twittes.count}`);

  let transactions = twittes.rows.map((tweet, index) => zilliqa.verifyTweet({
    profileId: tweet.User.profileId,
    tweetId: tweet.idStr,
    tweetText: tweet.text.toLowerCase(),
    startPos: getPos(tweet.text, blockchainInfo.hashtag)
  }, nonce + index + 1).catch((err) => console.log(err)));

  transactions = await Promise.all(transactions);

  // console.log(blockchainInfo.hashtag, JSON.stringify(twittes.rows[0], null, 4));
}()
