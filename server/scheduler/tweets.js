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

  let startIndex = text.indexOf(hashtag);

  return {
    startIndex,
    text: text.slice(0, startIndex + hashtag.length)
  };
}

module.exports = async function() {
  const twittes = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      txId: null
    },
    include: {
      model: User
    },
    limit: 1
  });
  const blockchainInfo = await Blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const { balance, nonce, address } = await zilliqa.getCurrentAccount();
  const balanceAmount = units.fromQa(new BN(balance), units.Units.Zil)

  debug(`account: ${address}, balance: ${balanceAmount}, nonce: ${nonce}`);
  debug(`need to VerifyTweet ${twittes.count}`);

  if (new BN(balance).lt(new BN('1000000000000'))) {
    throw new Error(`lack of funds ${balanceAmount}`);
  }

  for (let index = 0; index < twittes.rows.length; index++) {
    const tweet = twittes.rows[index];

    if (!tweet.User.zilAddress) {
      debug(`user with id: ${tweet.User.id}, has skipped`);
      continue;
    }

    try {
      await tweet.update({
        txId: 'peddling'
      });

      const { text, startIndex } = getPos(tweet.text, blockchainInfo.hashtag);
      const tx = await zilliqa.verifyTweet({
        profileId: tweet.User.profileId,
        tweetId: tweet.idStr,
        tweetText: text,
        startPos: startIndex
      }, nonce + index + 1);
  
      if (tx.id && tx.receipt.event_logs[0]['_eventname'] === 'VerifyTweetSuccessful') {
        await tweet.update({
          txId: tx.id,
          approved: true,
          rejected: false
        });
        debug('tweet:', tweet.idStr, 'has been verifed, tx hash:', tx.id);
        continue;
      } else if (tx.id && tx.receipt.event_logs[0]['_eventname'] !== 'VerifyTweetSuccessful') {
        await tweet.update({
          txId: tx.id,
          approved: false,
          rejected: true
        });
        debug('tweet:', tweet.idStr, 'has been rejected, tx hash:', tx.id, 'error:', tx.receipt.event_logs[0]['_eventname']);
        continue;
      }

      await tweet.update({
        txId: null,
        approved: false,
        rejected: false
      });
    } catch (err) {
      await tweet.update({
        txId: null
      });
      debug('tweet:', tweet.idStr, 'has not verifed error:', err);
    }
  }
}
