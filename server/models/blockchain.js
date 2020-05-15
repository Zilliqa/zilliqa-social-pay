'use strict';
const { validation } = require('@zilliqa-js/util');
module.exports = (sequelize, DataTypes) => {
  const blockchain = sequelize.define('blockchain', {
    contract: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isAddress(value) {
          if (!validation.isBech32(value)) {
            throw new Error('Invalid address format.')
          }
        }
      }
    },
    hashtag: {
      type: DataTypes.STRING,
      unique: true
    },
    zilsPerTweet: DataTypes.STRING,
    blocksPerDay: DataTypes.STRING,
    blocksPerWeek: DataTypes.STRING,
    BlockNum: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    DSBlockNum: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    rate: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 85940
    },
    balance: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    initBalance: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {});
  blockchain.associate = function(models) {
    // associations can be defined here
  };
  return blockchain;
};
