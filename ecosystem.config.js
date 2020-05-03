module.exports = {
  apps : [{
    name: "app",
    script: "node server/index.js",
    env: {
      NODE_ENV: "test",
      DEBUG: "zilliqa-social-pay:*",
      SESSION: "session",
      MAX_AMOUNT_NOTIFICATIONS: 3,
      JWT_SECRET: "SECRET",
      TWITTER_CONSUMER_KEY: "",
      NUMBER_OF_ADMINS: "10",
      TWITTER_CONSUMER_SECRET: "",
      CONTRACT_ADDRESS: ""
    }
  }]
}
