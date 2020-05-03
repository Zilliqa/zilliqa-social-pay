const EVENTS = require('../../config/socket-events');
const models = require('../models');

const {
  User,
  Twittes,
  blockchain,
  Notification
} = models.sequelize.models;

module.exports = (socket, io) => {
  /**
   * When blockchain has been updated,
   * then socket send blockchain data to all user.
   */
  blockchain.addHook('afterUpdate', (blockchain) => {
    socket.emit(EVENTS.info, JSON.stringify(blockchain));
  });

  /**
   * When User model has been updated,
   * then socket send msg with user data send
   * to only one user by `user profile id`.
   */
  User.addHook('afterUpdate', (user) => {
    delete user.dataValues.tokenSecret;
    delete user.dataValues.token;

    io.to(user.profileId).emit(EVENTS.userUpdated, JSON.stringify(user));
  });

  /**
   * When Tweet model has been updated,
   * then socket send to tweet owenr msg with tweet data.
   */
  Twittes.addHook('afterUpdate', async (tweet) => {
    const foundUser = await User.findOne({
      where: {
        id: tweet.UserId
      },
      attributes: {
        exclude: [
          'tokenSecret',
          'token'
        ]
      }
    });

    if (!foundUser) {
      return null;
    }

    delete tweet.dataValues.text;
    delete tweet.dataValues.updatedAt;
    delete tweet.dataValues.createdAt;

    io.to(foundUser.profileId).emit(EVENTS.userUpdated, JSON.stringify(foundUser));
    io.to(foundUser.profileId).emit(EVENTS.tweetsUpdate, JSON.stringify(tweet));
  });

  /**
   * When Notification model has been created,
   * then socket send notification to owner user.
   */
  Notification.addHook('afterCreate', (notificationData) => {
    const foundUser = await User.findOne({
      where: {
        id: notificationData.UserId
      },
      attributes: {
        exclude: [
          'tokenSecret',
          'token'
        ]
      }
    });

    if (!foundUser) {
      return null;
    }

    io.to(foundUser.profileId).emit(EVENTS.notificationCreate, JSON.stringify(notificationData));
  });
};
