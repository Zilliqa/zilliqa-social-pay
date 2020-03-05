'use strict';
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid').v4;

const secret = process.env.JWT_SECRET + uuidv4();

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    screenName: DataTypes.STRING,
    profileId: DataTypes.STRING,
    profileImageUrl: DataTypes.STRING,
    token: DataTypes.STRING,
    tokenSecret: DataTypes.STRING,
    zilAddress: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {});
  User.prototype.sign = function () {
    const payload = {
      id: this.id,
      profileId: this.profileId,
      username: this.username,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1h
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
