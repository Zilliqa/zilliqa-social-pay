const zilliqa = require('./zilliqa');
const models = require('./models');
const { BN } = require('@zilliqa-js/util');
const { toChecksumAddress, toBech32Address } = require('@zilliqa-js/crypto');

const {
  User,
  blockchain,
  Admin,
  Twittes,
  Notification
} = models.sequelize.models;

const statuses = new Admin().statuses;
const actions = new User().actions;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

module.exports = {
  events: {
    DeletedAdmin: 'DeletedAdmin',
    AddedAdmin: 'AddedAdmin',
    ConfiguredUserAddress: 'ConfiguredUserAddress',
    VerifyTweetSuccessful: 'VerifyTweetSuccessful',
    DepositSuccessful: 'DepositSuccessful',
    Error: 'Error'
  },
  keys: {
    adminAddress: 'admin_address',
    twitterId: 'twitter_id',
    recipientAddress: 'recipient_address',
    tweetId: 'tweet_id',
    depositAmount: 'deposit_amount'
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
    const user = await User.findOne({
      where: {
        profileId: twitterId
      }
    });
    const blockchainInfo = await blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });

    await user.update({
      zilAddress,
      synchronization: false,
      actionName: actions.configureUsers,
      lastAction: Number(blockchainInfo.BlockNum)
    });

    await Notification.create({
      UserId: user.id,
      title: 'Account',
      description: 'Address configured!'
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

    const foundTweet = await Twittes.findOne({
      where: { idStr },
      include: {
        model: User
      }
    });
    const blockchainInfo = await blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });

    await foundTweet.update({
      approved: true,
      rejected: false,
      block: Number(blockchainInfo.BlockNum)
    });
    await foundTweet.User.update({
      actionName: actions.verifyTweet,
      lastAction: Number(blockchainInfo.BlockNum)
    });
    await Notification.create({
      UserId: foundTweet.User.id,
      title: 'Tweet',
      description: 'Rewards claimed!'
    });

    return idStr;
  },
  async depositSuccessful(params) {
    const { value } = params.find(
      ({ vname }) => vname === this.keys.depositAmount
    );

    if (!value) {
      throw new Error(`Not found ${this.keys.depositAmount} vname in:`, params);
    }

    let blockchainInfo = await blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });

    let initBalance = blockchainInfo.initBalance;
    const currentBalance = new BN(blockchainInfo.balance);
    const needToAdd = new BN(value);
    const balance = String(currentBalance.add(needToAdd));

    if (Number(initBalance) < Number(balance)) {
      initBalance = balance;
    }

    await blockchainInfo.update({
      balance,
      initBalance
    });
  }
};
