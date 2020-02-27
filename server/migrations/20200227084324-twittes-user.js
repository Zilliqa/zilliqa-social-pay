module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Twittes', 'UserId', {
    type: Sequelize.INTEGER,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    allowNull: true,
  }),
  down: queryInterface =>
    queryInterface.removeColumn(
      'Twittes',
      'UserId',
    )
}
