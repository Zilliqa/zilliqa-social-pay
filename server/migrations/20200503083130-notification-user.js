'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Notifications', 'UserId', {
    type: Sequelize.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }),
  down: queryInterface =>
    queryInterface.removeColumn(
      'Notifications',
      'UserId'
    )
}
