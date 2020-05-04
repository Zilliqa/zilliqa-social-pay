'use strict';
const types = require('../../config/notifications-types');
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING
  }, {});
  Notification.prototype.types = types;
  Notification.associate = function(models) {
    // associations can be defined here
    Notification.belongsTo(models.User, {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: true
    });
  };
  return Notification;
};
