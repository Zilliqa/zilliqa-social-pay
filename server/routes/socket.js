const EVENTS = require('../../config/socket-events');
const models = require('../models');

const {
  User,
  Twittes,
  blockchain
} = models.sequelize.models;

module.exports = (socket, io) => {
  blockchain.addHook('afterUpdate', (blockchain) => {
    socket.emit(EVENTS.info, JSON.stringify(blockchain));
  });
  User.addHook('afterUpdate', (user) => {
    delete user.dataValues.tokenSecret;
    delete user.dataValues.token;

    io.to(user.profileId).emit(EVENTS.userUpdated, JSON.stringify(user));
  });
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
};
