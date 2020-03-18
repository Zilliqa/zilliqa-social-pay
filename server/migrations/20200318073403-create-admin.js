'use strict';
const statuses = {
  disabled: 'disabled',
  enabled: 'enabled'
};
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bech32Address: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      privateKey: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      balance: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM(statuses.disabled, statuses.enabled),
        allowNull: false,
        defaultValue: statuses.enabled
      },
      inProgress: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      nonce: {
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('Admins');
  }
};