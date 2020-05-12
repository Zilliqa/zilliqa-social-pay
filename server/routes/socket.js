const EVENTS = require('../../config/socket-events');
const models = require('../models');

const {
  User,
  Twittes,
  blockchain,
  Notification
} = models.sequelize.models;

module.exports = async (socket, io, message) => {
  const payload = JSON.parse(message);

  switch (payload.model) {
    case blockchain.tableName:
      socket.emit(EVENTS.info, JSON.stringify(payload.body));
      break;
    case Twittes.tableName:
      const foundTweet = await Twittes.findOne({
        where: payload.body.id,
        include: {
          model: User,
          attributes: [
            'profileId'
          ]
        },
        attributes: {
          exclude: [
            'text',
            'updatedAt'
          ]
        }
      });
      io
        .to(foundTweet.User.profileId)
        .emit(EVENTS.tweetsUpdate, JSON.stringify(foundTweet));
      break;
    case User.tableName:
      const foundUser = await User.findOne({
        where: {
          id: payload.body.id
        },
        attributes: {
          exclude: [
            'tokenSecret',
            'token'
          ]
        }
      });
      io
        .to(foundUser.profileId)
        .emit(EVENTS.userUpdated, JSON.stringify(foundUser));
      break;
    case Notification.tableName:
      const userNotification = await User.findOne({
        where: {
          id: payload.body.UserId
        },
        attributes: [
          'profileId'
        ]
      });
      io
        .to(userNotification.profileId)
        .emit(EVENTS.notificationCreate, JSON.stringify(payload.body));
      break;
    default:
      break;
  }
};
