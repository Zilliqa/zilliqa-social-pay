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
    CurrentDSEpoch: DataTypes.STRING,
    CurrentMiniEpoch: DataTypes.STRING,
    NumDSBlocks: DataTypes.STRING,
    NumTxBlocks: DataTypes.STRING
  }, {});
  blockchain.associate = function(models) {
    // associations can be defined here
  };
  return blockchain;
};