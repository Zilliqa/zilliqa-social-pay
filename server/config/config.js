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
    "username": "postgres",
    "password": "postgres",
    "database": "database_social_pay",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false,
    "pool": {
      "max": 9,
      "min": 0,
      "idle": 10000
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
      "max": 9,
      "min": 0,
      "idle": 10000
    }
  }
}
