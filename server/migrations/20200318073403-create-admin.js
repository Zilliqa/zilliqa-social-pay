'use strict';
const statuses = {
  disabled: 'disabled',
  injob: 'injob',
  free: 'free'
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
        type: Sequelize.ENUM(statuses.disabled, statuses.injob, statuses.free),
        allowNull: false,
        defaultValue: statuses.free
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