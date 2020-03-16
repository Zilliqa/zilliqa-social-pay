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
      ADMIN_PRIVATE_KEY: "",
      CONTRACT_ADDRESS: ""
    }
  }, {
    name: "scheduler",
    script: "node server/scheduler/index.js",
    env: {
      NODE_ENV: "production",
      DEBUG: "zilliqa-social-pay:*",
      SESSION: "session",
      JWT_SECRET: "SECRET",
      TWITTER_CONSUMER_KEY: "",
      TWITTER_CONSUMER_SECRET: "",
      ADMIN_PRIVATE_KEY: "",
      CONTRACT_ADDRESS: ""
    }
  }]
}
