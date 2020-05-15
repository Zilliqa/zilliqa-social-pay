const channels = {
  TX_HANDLER: 'TX_HANDLER',
  WEB: 'WEB'
};

module.exports = {
  development: {
    channels,
    url: 'redis://127.0.0.1:6379'
  },
  test: {
    channels,
    url: process.env.REDIS_URL
  },
  production: {
    channels,
    url: process.env.REDIS_URL
  }
}
