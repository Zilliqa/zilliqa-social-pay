const zilliqa = require('./zilliqa');
const models = require('./models');
const { toChecksumAddress, toBech32Address } = require('@zilliqa-js/crypto');

const Admin = models.sequelize.models.Admin;
const User = models.sequelize.models.User;
const Twittes = models.sequelize.models.Twittes;
const statuses = new Admin().statuses;

module.exports = {
  events: {
    DeletedAdmin: 'DeletedAdmin',
    AddedAdmin: 'AddedAdmin',
    ConfiguredUserAddress: 'ConfiguredUserAddress',
    VerifyTweetSuccessful: 'VerifyTweetSuccessful',
    Error: 'Error'
  },
  keys: {
    adminAddress: 'admin_address',
    twitterId: 'twitter_id',
    recipientAddress: 'recipient_address',
    tweetId: 'tweet_id'
  },
  async deletedAdmin(params) {
    const { value } = params.find(
      ({ vname }) => vname === this.keys.adminAddress
    );

    if (!value) {
      throw new Error(`Not found ${this.keys.adminAddress} vname in:`, params);
    }

    const address = toChecksumAddress(value);

    await Admin.update({
      status: statuses.disabled
    }, {
      where: { address }
    });

    return toBech32Address(address);
  },
  async addedAdmin(params) {
    const { value } = params.find(
      ({ vname }) => vname === this.keys.adminAddress
    );

    if (!value) {
      throw new Error(`Not found ${this.keys.adminAddress} vname in:`, params);
    }

    const address = toChecksumAddress(value);
    let balance = '0';
    let nonce = 0;

    try {
      const res = await zilliqa.getCurrentAccount(address);
    
      balance = res.balance;
      nonce = res.nonce;
    } catch (err) {
      // skip
    }

    await Admin.update({
      balance,
      nonce,
      status: statuses.enabled
    }, {
      where: { address }
    });

    return toBech32Address(address);
  },
  async configuredUserAddress(params) {
    const twitterId = params.find(
      ({ vname }) => vname === this.keys.twitterId
    ).value;
    const recipientAddress = params.find(
      ({ vname }) => vname === this.keys.recipientAddress
    ).value;

    if (!twitterId) {
      throw new Error(`Not found ${this.keys.twitterId} vname in:`, params);
    }

    if (!recipientAddress) {
      throw new Error(`Not found ${this.keys.recipientAddress} vname in:`, params);
    }

    const zilAddress = toBech32Address(recipientAddress);

    await User.update({
      synchronization: false
    }, {
      where: {
        zilAddress,
        profileId: twitterId
      }
    });

    return twitterId;
  },
  async verifyTweetSuccessful(params) {
    const idStr = params.find(
      ({ vname }) => vname === this.keys.tweetId
    ).value;

    if (!idStr) {
      throw new Error(`Not found ${this.keys.tweetId} vname in:`, params);
    }

    await Twittes.update({
      approved: true,
      rejected: false
    }, {
      where: { idStr }
    });

    return idStr;
  }
};
