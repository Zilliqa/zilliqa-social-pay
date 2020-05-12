const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'tx-handler:verify-tweet' });
const zilliqa = require('../zilliqa');
const { Op } = require('sequelize');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const {
  User,
  Twittes,
  blockchain,
  Notification
} = models.sequelize.models;
const notificationTypes = new Notification().types;
const dangerTweet = 'Danger tweet.';

function getPos(text, hashtag) {
  text = encodeURI(text.toLowerCase());
  hashtag = hashtag.toLowerCase();

  const startIndex = text.indexOf(hashtag);

  if (startIndex < 0) {
    throw new Error(dangerTweet);
  }

  text = text.slice(0, startIndex + hashtag.length);

  return {
    startIndex,
    text
  };
}

module.exports = async function (task, admin) {
  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
  });
  const lastActionTweet = await Twittes.findOne({
    order: [
      ['block', 'DESC']
    ],
    where: {
      UserId: task.payload.userId
    },
    attributes: [
      'block'
    ]
  });

  if (lastActionTweet && Number(lastActionTweet.block) > Number(blockchainInfo.BlockNum)) {
    throw new Error(`Current blockNumber ${blockchainInfo.BlockNum} but user last blocknumber ${lastActionTweet.block}`);
  }

  const tweet = await Twittes.findOne({
    where: {
      id: task.payload.tweetId,
      approved: false,
      rejected: false,
      txId: null,
      claimed: true
    },
    include: {
      model: User,
      where: {
        id: task.payload.userId,
        synchronization: false,
        zilAddress: {
          [Op.not]: null
        }
      }
    }
  });

  if (!tweet) {
    log.warn('tweet is null. tweetID:', task.payload.tweetId);
    return null;
  }

  const lastWithdrawal = await zilliqa.getLastWithdrawal([tweet.User.profileId]);

  if (lastWithdrawal && lastWithdrawal >= Number(blockchainInfo.BlockNum)) {
    throw new Error(`Current blockNumber ${blockchainInfo.BlockNum} but user last blocknumber ${lastWithdrawal}`);
  }

  const registered = await zilliqa.getVerifiedTweets([tweet.idStr]);

  if (registered && registered[tweet.idStr]) {
    await tweet.update({
      approved: true,
      claimed: true,
      rejected: false,
      block: lastWithdrawal
    });
    await Notification.create({
      UserId: tweet.User.id,
      type: notificationTypes.tweetClaimed,
      title: 'Tweet',
      description: 'Rewards claimed!'
    });

    log.warn('Tweet: ', tweet.idStr, 'already registered');

    return null;
  }

  await tweet.update({
    block: blockchainInfo.BlockNum
  });

  try {
    const { text, startIndex } = getPos(tweet.text, blockchainInfo.hashtag);
    const tx = await zilliqa.verifyTweet({
      profileId: tweet.User.profileId,
      tweetId: tweet.idStr,
      tweetText: text,
      startPos: startIndex
    }, admin);
    await tweet.update({
      txId: tx.TranID,
      block: Number(blockchainInfo.BlockNum)
    });

    log.info('Tweet: ', tweet.idStr, 'sent to shard txID:', tx.TranID);

    return tweet;
  } catch (err) {
    log.error('TweetID:', task.payload.tweetId, 'error', err);

    if (err.message === dangerTweet) {
      await tweet.destroy();
      await Notification.create({
        UserId: tweet.User.id,
        type: notificationTypes.tweetReject,
        title: 'Tweet',
        description: 'Danger tweet.'
      });

      throw new Error(err);
    }

    await tweet.update({
      block: lastWithdrawal
    });

    throw new Error(err);
  }
}
