'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('blockchains', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contract: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      hashtag: {
        type: Sequelize.STRING,
        unique: true
      },
      zilsPerTweet: {
        type: Sequelize.STRING
      },
      blocksPerDay: {
        type: Sequelize.STRING
      },
      blocksPerWeek: {
        type: Sequelize.STRING
      },
      CurrentDSEpoch: {
        type: Sequelize.STRING
      },
      CurrentMiniEpoch: {
        type: Sequelize.STRING
      },
      NumDSBlocks: {
        type: Sequelize.STRING
      },
      NumTxBlocks: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('blockchains');
  }
};