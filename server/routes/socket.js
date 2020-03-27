const EVENTS = require('../../config/socket-events');
const models = require('../models');

const User = models.sequelize.models.User;
const Blockchain = models.sequelize.models.blockchain;
const Twittes = models.sequelize.models.Twittes;

module.exports = (socket) => {
  Blockchain.addHook('afterUpdate', (blockchain) => {
    socket.emit(EVENTS.info, JSON.stringify(blockchain));
  });
  User.addHook('afterUpdate', (user) => {
    delete user.dataValues.tokenSecret;
    delete user.dataValues.token;

    socket.emit(EVENTS.userUpdated, JSON.stringify(user));
  });
  Twittes.addHook('afterUpdate', (tweet) => {
    socket.emit(EVENTS.tweetsUpdate, JSON.stringify(tweet));
  });
};
