'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING
  }, {});
  Notification.associate = function(models) {
    // associations can be defined here
    Notification.belongsTo(models.User, {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false
    });
  };
  return Notification;
};