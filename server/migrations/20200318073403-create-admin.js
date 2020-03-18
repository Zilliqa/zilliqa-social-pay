'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bech32: {
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
        type: Sequelize.STRING,
        allowNull: true
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