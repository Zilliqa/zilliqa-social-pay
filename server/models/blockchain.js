'use strict';
module.exports = (sequelize, DataTypes) => {
  const blockchain = sequelize.define('blockchain', {
    contract: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
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
    }
  }, {});
  blockchain.associate = function(models) {
    // associations can be defined here
  };
  return blockchain;
};