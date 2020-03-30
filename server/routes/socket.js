const EVENTS = require('../../config/socket-events');
const models = require('../models');

const User = models.sequelize.models.User;
const Blockchain = models.sequelize.models.blockchain;
const Twittes = models.sequelize.models.Twittes;

module.exports = (socket, io) => {
  Blockchain.addHook('afterUpdate', (blockchain) => {
    socket.broadcast.emit(EVENTS.info, JSON.stringify(blockchain));
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

    io.to(foundUser.profileId).emit(EVENTS.userUpdated, JSON.stringify(foundUser));
    io.to(foundUser.profileId).emit(EVENTS.tweetsUpdate, JSON.stringify(tweet));
  });
};
