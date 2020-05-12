const channel = 'socialPay';

module.exports = {
  development: {
    channel,
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  },
  test: {
    channel,
    url: process.env.REDIS_URL
  },
  production: {
    channel,
    url: process.env.REDIS_URL
  }
}
