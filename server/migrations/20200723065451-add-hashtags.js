'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'blockchains',
      'hashtags',
      Sequelize.RANGE(Sequelize.STRING)
    );
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'blockchains',
      'hashtags'
    );
  }
};
