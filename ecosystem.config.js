module.exports = {
  apps : [{
    name: "app",
    script: "node server/index.js",
    env: {
      NODE_ENV: "production",
      DEBUG: "zilliqa-social-pay:*",
      SESSION: "session",
      JWT_SECRET: "SECRET",
      TWITTER_CONSUMER_KEY: "",
      TWITTER_CONSUMER_SECRET: "",
      CONTRACT_ADDRESS: ""
    }
  }]
}
