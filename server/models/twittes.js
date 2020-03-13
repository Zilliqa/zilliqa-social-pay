'use strict';
module.exports = (sequelize, DataTypes) => {
  const Twittes = sequelize.define('Twittes', {
    idStr: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rejected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    txId: {
      type: DataTypes.STRING
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
