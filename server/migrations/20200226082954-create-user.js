'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      screenName: {
        type: Sequelize.STRING
      },
      profileId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      profileImageUrl: {
        type: Sequelize.STRING
      },
      token: {
        type: Sequelize.STRING
      },
      tokenSecret: {
        type: Sequelize.STRING
      },
      zilAddress: {
        type: Sequelize.STRING,
        unique: true
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
    return queryInterface.dropTable('Users');
  }
};