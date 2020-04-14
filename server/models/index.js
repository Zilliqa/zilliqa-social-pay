'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('zilliqa-social-pay:sequelize');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize.authenticate().then(() => {
  debug(`Sequelize: Connection ${config.database} successfully.`);

  if (env === 'development' && config.sync && config.sync.enable) {
    return sequelize.sync(config.sync);
  }
}).catch(error => {
  console.error('\x1b[31mSequelize: Unable to connect to the database:\x1b[0m', error);
}).catch(error => {
  console.error('\x1b[31mSequelize: Sync models failed:\x1b[0m', error);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
