const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'tx-handler:verify-tweet' });
const { promisify } = require('util');
const zilliqa = require('../zilliqa');
const { Op } = require('sequelize');
const models = require('../models');

const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];
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

module.exports = async function (task, admin, redisClient) {
  const getAsync = promisify(redisClient.get).bind(redisClient);
  const blockchainInfo = JSON.parse(await getAsync(blockchain.tableName));
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
  const amountBlocks = Number(blockchainInfo.blocksPerDay);
  const lastBlockForClaim = lastWithdrawal + amountBlocks

  if (lastWithdrawal && lastBlockForClaim >= Number(blockchainInfo.BlockNum)) {
    log.warn(`TweetID: ${tweet.id}, Current blockNumber ${lastBlockForClaim} but user last blocknumber ${lastWithdrawal}`);
    return null;
  }

  const registered = await zilliqa.getVerifiedTweets([tweet.idStr]);

  if (registered && registered[tweet.idStr]) {
    await tweet.update({
      approved: true,
      claimed: true,
      rejected: false,
      block: lastWithdrawal
    });
    const notification = await Notification.create({
      UserId: tweet.User.id,
      type: notificationTypes.tweetClaimed,
      title: 'Tweet',
      description: 'Rewards claimed!'
    });
    redisClient.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
      model: Notification.tableName,
      body: notification
    }));

    log.warn('Tweet: ', tweet.idStr, 'already registered');

    return tweet;
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
      const notification = await Notification.create({
        UserId: tweet.User.id,
        type: notificationTypes.tweetReject,
        title: 'Tweet',
        description: 'Danger tweet.'
      });
      redisClient.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
        model: Notification.tableName,
        body: notification
      }));

      throw new Error(err);
    }

    await tweet.update({
      block: lastWithdrawal
    });

    throw new Error(err);
  }
}
