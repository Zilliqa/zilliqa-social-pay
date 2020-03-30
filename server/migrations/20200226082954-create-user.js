'use strict';
const statuses = {
  baned: 'baned',
  enabled: 'enabled'
};
const actions = {
  configureUsers: 'ConfigureUsers',
  verifyTweet: 'VerifyTweet'
};
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
      hash: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      lastAction: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM(statuses.baned, statuses.enabled),
        allowNull: false,
        defaultValue: statuses.enabled
      },
      actionName: {
        type: Sequelize.ENUM(actions.configureUsers, actions.verifyTweet),
        allowNull: true
      },
      synchronization: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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