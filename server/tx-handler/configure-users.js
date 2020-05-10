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

module.exports = async function (task, admin) {
  const user = await User.findOne({
    where: {
      id: task.payload.userId,
      synchronization: true,
      zilAddress: {
        [Op.not]: null
      },
      hash: null,
      status: new User().statuses.enabled
    }
  });
  const userExist = await zilliqa.getonfigureUsers([user.profileId]);

  return new Promise((resolve) => {
    setTimeout(() => resolve(), 3000);
  });
}
