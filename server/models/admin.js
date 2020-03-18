'use strict';
const { validation } = require('@zilliqa-js/util');
const statuses = {
  disabled: 'disabled',
  injob: 'injob',
  free: 'free'
};
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    bech32Address: {
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
    address: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isAddress(value) {
          if (!validation.isAddress(value)) {
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
    },
    status: {
      type: DataTypes.ENUM(statuses.disabled, statuses.injob, statuses.free),
      allowNull: false,
      defaultValue: statuses.free
    }
  }, {});
  Admin.prototype.statuses = statuses;
  Admin.associate = function(models) {
    // associations can be defined here
  };
  return Admin;
};
