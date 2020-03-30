'use strict';
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const statuses = {
  baned: 'baned',
  enabled: 'enabled'
};
const actions = {
  configureUsers: 'ConfigureUsers',
  verifyTweet: 'VerifyTweet'
};
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    screenName: DataTypes.STRING,
    profileId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    profileImageUrl: DataTypes.STRING,
    token: DataTypes.STRING,
    tokenSecret: DataTypes.STRING,
    zilAddress: {
      type: DataTypes.STRING,
      unique: true
    },
    hash: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    lastAction: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    actionName: {
      type: DataTypes.ENUM(actions.configureUsers, actions.verifyTweet),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(statuses.baned, statuses.enabled),
      allowNull: false,
      defaultValue: statuses.enabled
    },
    synchronization: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {});
  User.prototype.statuses = statuses;
  User.prototype.actions = actions;
  User.prototype.sign = function () {
    const payload = {
      id: this.id,
      profileId: this.profileId,
      username: this.username,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 60),
    }

    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, (err, token) => {
        if (err) {
          return reject(err)
        }
        return resolve({ token })
      })
    })
  }
  User.prototype.verify = function (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          return reject(err)
        }

        return resolve(decoded)
      })
    })
  }
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Twittes, {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false
    })
  };
  return User;
};
