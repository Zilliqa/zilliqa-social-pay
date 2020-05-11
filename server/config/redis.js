module.exports = {
  development: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  },
  test: {
    url: process.env.REDIS_URL
  },
  production: {
    url: process.env.REDIS_URL
  }
}
