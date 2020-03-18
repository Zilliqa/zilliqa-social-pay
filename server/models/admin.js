'use strict';
const { validation } = require('@zilliqa-js/util');
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    bech32: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isBech32(value) {
          if (!validation.isBech32(value)) {
            throw new Error('Invalid address format.')
          }
        }
      }
    },
    privateKey: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isPrivateKey(value) {
          if (!validation.isPrivateKey(value)) {
            throw new Error('Invalid privateKey.')
          }
        }
      }
    },
    balance: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    }
  }, {});
  Admin.associate = function(models) {
    // associations can be defined here
  };
  return Admin;
};
