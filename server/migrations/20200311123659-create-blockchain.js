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
      BlockNum: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      DSBlockNum: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
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