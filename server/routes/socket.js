const EVENTS = require('../../config/socket-events');
const models = require('../models');

const User = models.sequelize.models.User;

const getUser = async (jwtToken) => {
  const user = new User();
  const decoded = await user.verify(jwtToken);
  return User.findOne({
    where: {
      id: decoded.id
    },
    attributes: {
      exclude: [
        'tokenSecret',
        'token'
      ]
    }
  });
}

User.addHook('afterUpdate', (user, options) => {
  console.log(user, options);
});

module.exports = (socket) => {
  socket.on(EVENTS.info, async (data) => {
    const user = await getUser(data);

    socket.emit(EVENTS.info, {
      username: user.profileId,
      message: JSON.stringify(user)
    });
  });
};
