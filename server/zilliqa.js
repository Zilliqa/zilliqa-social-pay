require('dotenv').config();

const { Op } = require('sequelize');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { Account, TxStatus } = require('@zilliqa-js/account');
const { RPCMethod } = require('@zilliqa-js/core');
const { validation, BN, Long, bytes, units } = require('@zilliqa-js/util');
const { toBech32Address, fromBech32Address, schnorr } = require('@zilliqa-js/crypto');
const models = require('./models');

const Admin = models.sequelize.models.Admin;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDERS = {
  mainnet: 'https://dev-api.zilliqa.com',
  testnet: 'https://dev-api.zilliqa.com'
};
const ENV = process.env.NODE_ENV;
const CHAIN_ID = 333;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);

let httpNode = PROVIDERS.mainnet;

if (ENV !== 'production') {
  httpNode = PROVIDERS.testnet;
}

if (!validation.isBech32(CONTRACT_ADDRESS)) {
  throw new Error('contract address: ', CONTRACT_ADDRESS, 'must be Bech32 format.');
}

module.exports = {
  async getAccount() {
    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);
    const statuses = new Admin().statuses;
    const account = await Admin.findOne({
      where: {
        status: statuses.enabled,
        inProgress: false,
        balance: {
          [Op.gte]: '5000000000000' // 5ZILs
        }
      },
      order: [
        ['balance', 'DESC']
      ]
    });

    if (!account) {
      throw new Error('Not found admin account');
    }

    let { nonce } = await this.getCurrentAccount(account.address);

    zilliqa.wallet.addByPrivateKey(account.privateKey);
    zilliqa.wallet.setDefault(account.address);

    if (nonce > account.nonce) {
      nonce = account.nonce;
    }

    nonce++;

    return {
      account,
      contract,
      nonce,
      zilliqa
    };
  },
  async getInit() {
    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);
    const [
      owner,
      hashtag,
      zils_per_tweet,
      blocks_per_day,
      blocks_per_week
    ] = await contract.getInit();

    return {
      contract: CONTRACT_ADDRESS,
      owner: toBech32Address(owner.value),
      hashtag: hashtag.value.toLowerCase(),
      zilsPerTweet: zils_per_tweet.value,
      blocksPerDay: blocks_per_day.value,
      blocksPerWeek: blocks_per_week.value
    }
  },
  async getVerifiedTweets(tweetsID) {
    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);
    const result = await contract.getSubState('verified_tweets', [tweetsID]);
    
    if (!result) {
      return {
        not_verified_tweets: tweetsID
      };
    }

    return result;
  },
  async blockchainInfo() {
    const zilliqa = new Zilliqa(httpNode);
    const { result } = await zilliqa.blockchain.getBlockChainInfo();

    return result;
  },
  async configureUsers(profileId, address) {
    if (validation.isBech32(address)) {
      address = fromBech32Address(address);
    }

    let tx = null;
    const { contract, nonce, account } = await this.getAccount();

    try {
      const params = [
        {
          vname: 'twitter_id',
          type: 'String',
          value: `${profileId}`
        },
        {
          vname: 'recipient_address',
          type: 'ByStr20',
          value: `${address}`
        }
      ];
      await account.update({
        inProgress: true
      });
      tx = await contract.call('ConfigureUsers', params, {
        nonce,
        version: VERSION,
        amount: new BN(0),
        gasPrice: units.toQa('1000', units.Units.Li),
        gasLimit: Long.fromNumber(25000)
      });
    } catch (err) {
      console.log(err);
    } finally {
      const result = await this.getCurrentAccount(account.address);

      await account.update({
        nonce: result.nonce,
        balance: result.balance,
        inProgress: false
      });
    }

    if (tx.id && tx.receipt['event_logs'] && tx.receipt['event_logs'][0]['_eventname'] !== 'ConfiguredUserAddress') {
      throw new Error(tx.receipt['event_logs'][0]['_eventname']);
    } else if (!tx || !tx.id) {
      throw new Error('Tx has not confirmed.');
    }

    return tx;
  },
  async verifyTweet(data) {
    let tx = null;
    const { contract, nonce, account } = await this.getAccount();

    await account.update({
      inProgress: true
    });

    try {
      const params = [
        {
          vname: 'twitter_id',
          type: 'String',
          value: `${data.profileId}`
        },
        {
          vname: 'tweet_id',
          type: 'String',
          value: `${data.tweetId}`
        },
        {
          vname: 'tweet_text',
          type: 'String',
          value: `${data.tweetText}`
        },
        {
          vname: 'start_pos',
          type: 'Uint32',
          value: `${data.startPos}`
        }
      ];
      tx = await contract.call('VerifyTweet', params, {
        nonce,
        version: VERSION,
        amount: new BN(0),
        gasPrice: units.toQa('1000', units.Units.Li),
        gasLimit: Long.fromNumber(25000)
      });
    } catch (err) {
      console.log(err);
    } finally {
      const result = await this.getCurrentAccount(account.address);

      await account.update({
        nonce: result.nonce,
        balance: result.balance,
        inProgress: false
      });
    }

    if (!tx || !tx.id) {
      throw new Error('Tx has not confirmed.');
    }

    return tx;
  },
  async getCurrentAccount(address) {
    const zilliqa = new Zilliqa(httpNode);

    try {
      const { error, result } = await zilliqa.blockchain.getBalance(address);

      return {
        ...result,
        address
      };
    } catch (err) {
      return {
        balance: '0',
        nonce: 0,
        address
      };
    }
  },
  async generateAddresses(amount) {
    const statuses = new Admin().statuses;
    const count = await Admin.count({
      where: {
        status: {
          [Op.not]: statuses.disabled
        }
      }
    });

    for (let index = count; index < amount; index++) {
      const privateKey = schnorr.generatePrivateKey();
      const account = new Account(privateKey);
      let balance = '0';

      try {
        const { result } = await zilliqa.blockchain.getBalance(account.address);

        balance = result.balance
      } catch (err) {
        //
      }

      await Admin.create({
        ...account,
        balance
      });
    }

    return Admin.findAll({
      where: {
        status: {
          [Op.not]: statuses.disabled
        }
      },
      attributes: [
        'bech32Address',
        'balance',
        'status'
      ]
    });
  },
  fromZil(value) {
    const _1000 = 1000;
    const amount = units.fromQa(new BN(value), units.Units.Zil);

    return String(Math.round(Number(amount) * _1000) / _1000);
  }
};
