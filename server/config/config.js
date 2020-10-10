require('dotenv').config();

module.exports = {
  "development": {
    "database": "dev_social_pay",
    "dialect": "sqlite",
    "logging": false,
    "sync": {
      "enable": false,
      "force": false
    },
    "storage": "storage.sql"
  },
  "test": {
    "username": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB,
    "host": process.env.POSTGRES_HOST,
    "dialect": "postgres",
    "logging": false,
    "pool": {
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 60000,
      evict: 60000,
      handleDisconnects: true
    }
  },
  "production": {
    "username": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB,
    "host": process.env.POSTGRES_HOST,
    "dialect": "postgres",
    "logging": false,
    "pool": {
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 60000,
      evict: 60000,
      handleDisconnects: true
    }
  }
}
