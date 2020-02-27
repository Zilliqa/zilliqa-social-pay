'use strict';
module.exports = (sequelize, DataTypes) => {
  const Twittes = sequelize.define('Twittes', {
    twittId: DataTypes.STRING,
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    txId: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {});
  Twittes.associate = function(models) {
    // associations can be defined here
    Twittes.belongsTo(models.User, {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false
    })
  };
  return Twittes;
};
