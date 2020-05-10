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
  const registered = await zilliqa.getVerifiedTweets([tweet.idStr]);

  if (registered && registered[tweet.idStr]) {
    await tweet.update({
      approved: true,
      claimed: true,
      rejected: false,
      block: 0
    });
    await Notification.create({
      UserId: tweet.User.id,
      type: notificationTypes.tweetClaimed,
      title: 'Tweet',
      description: 'Rewards claimed!'
    });

    return null;
  }

  const blockchainInfo = await blockchain.findOne({
    where: { contract: CONTRACT_ADDRESS }
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

    return tweet;
  } catch (err) {
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

    await Notification.create({
      UserId: tweet.User.id,
      type: notificationTypes.tweetReject,
      title: 'Tweet',
      description: 'Claiming error!'
    });
    await tweet.update({
      approved: false,
      rejected: false,
      claimed: false,
      block: 0,
      txId: null
    });

    throw new Error(err);
  }
}
