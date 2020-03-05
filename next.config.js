require('dotenv').config();

const path = require('path');

module.exports = {
  serverRuntimeConfig: {
    // Will only be available on the server side
    secret: 'secret'
  },
  webpack: function (c) {
    c.resolve.alias = {
      ...c.resolve.alias,
      components: path.resolve(__dirname, './components'),
      config: path.resolve(__dirname, './config')
    };

    return c;
  }
}
