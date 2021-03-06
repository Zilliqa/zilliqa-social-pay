require('dotenv').config();

const { Op } = require('sequelize');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { RPCMethod } = require('@zilliqa-js/core');
const { StatusType, MessageType } = require('@zilliqa-js/subscriptions');
const { Account } = require('@zilliqa-js/account');
const { validation, BN, Long, bytes, units } = require('@zilliqa-js/util');
const {
  toChecksumAddress,
  toBech32Address,
  fromBech32Address,
  schnorr
} = require('@zilliqa-js/crypto');
const eventUtils = require('./event-utils');
const models = require('./models');

const { Admin } = models.sequelize.models;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const HTTP_PROVIDERS = {
  mainnet: 'https://api.zilliqa.com',
  testnet: 'https://dev-api.zilliqa.com'
};
const WS_PROVIDERS = {
  mainnet: 'wss://api-ws.zilliqa.com',
  testnet: 'wss://dev-ws.zilliqa.com'
};
const ENV = process.env.NODE_ENV;
const MSG_VERSION = 1;

let httpNode = HTTP_PROVIDERS.mainnet;
let wsNode = WS_PROVIDERS.mainnet;

if (ENV !== 'production') {
  httpNode = HTTP_PROVIDERS.testnet;
  wsNode = WS_PROVIDERS.testnet;
}

if (!validation.isBech32(CONTRACT_ADDRESS)) {
  throw new Error('contract address: ', CONTRACT_ADDRESS, 'must be Bech32 format.');
}

module.exports = {
  async getonfigureUsers(profileIds) {
    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);

    try {
      const result = await contract.getSubState(
        'registered_users',
        profileIds
      );

      if (result.registered_users) {
        return result.registered_users;
      }

      return null;
    } catch (err) {
      return null;
    }
  },
  async getVerifiedTweets(tweetIds) {
    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);

    try {
      const result = await contract.getSubState(
        'verified_tweets',
        tweetIds
      );

      if (result.verified_tweets) {
        return result.verified_tweets
      }

      return result
    } catch (err) {
      return null;
    }
  },
  async getLastWithdrawal(profileIds) {
    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);
    const result = await contract.getSubState(
      'last_claims',
      profileIds
    );
    const [profileId] = profileIds;

    if (result && result.last_claims && result.last_claims[profileId]) {
      return Number(result.last_claims[profileId]);
    }

    return null;
  },
  async getAccount(adminAccount) {
    if (!adminAccount) {
      throw new Error('admin account is required.');
    }

    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);
    const statuses = new Admin().statuses;
    const account = await Admin.findOne({
      where: {
        status: statuses.enabled,
        balance: {
          [Op.gte]: '5000000000000' // 5ZILs
        },
        bech32Address: adminAccount
      }
    });

    if (!account) {
      throw new Error('Not found admin account');
    }

    const nonce = account.nonce + 1;

    zilliqa.wallet.addByPrivateKey(account.privateKey);
    zilliqa.wallet.setDefault(account.address);

    return {
      account,
      contract,
      nonce,
      zilliqa
    };
  },
  async getAdmins() {
    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);

    try {
      const { admins } = await contract.getSubState('admins');

      return Object.keys(admins).map((address) => toChecksumAddress(address));
    } catch (err) {
      return [];
    }
  },
  async getInit() {
    const zilliqa = new Zilliqa(httpNode);
    const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);
    let [
      owner,
      hashtags,
      zils_per_tweet,
      blocks_per_day,
      blocks_per_week
    ] = await contract.getInit();

    hashtags = hashtags.value

    return {
      hashtags,
      contract: CONTRACT_ADDRESS,
      owner: toBech32Address(owner.value),
      hashtag: hashtags[0],
      zilsPerTweet: zils_per_tweet.value,
      blocksPerDay: blocks_per_day.value,
      blocksPerWeek: blocks_per_week.value
    }
  },
  async getVerifiedUsers(hash) {
    const zilliqa = new Zilliqa(httpNode);
    const tx = await zilliqa.blockchain.getTransaction(hash);

    if (!tx || !tx.receipt || !tx.receipt.event_logs) {
      throw new Error('Event logs is null');
    }

    const { _eventname, params } = tx.receipt.event_logs.find(
      (e) => (e._eventname === eventUtils.events.ConfiguredUserAddress) ||
        (e._eventname === eventUtils.events.Error)
    );

    switch (_eventname) {
      case eventUtils.events.ConfiguredUserAddress:
        return eventUtils.configuredUserAddress(params);

      case eventUtils.events.Error:
        throw new Error(params);

      default:
        break;
    }
  },
  async blockchainInfo() {
    const zilliqa = new Zilliqa(httpNode);
    const { result } = await zilliqa.blockchain.getBlockChainInfo();

    return result;
  },
  async verifyTweet(params, adminAccount) {
    const { contract, nonce, account, zilliqa } = await this.getAccount(adminAccount);
    const version = await this.version();
    const calcGasLimit = params.length < 6 ? 9000 : 1500 * params.length;
    const data = JSON.stringify({
      _tag: 'VerifyTweets',
      params: [
        {
          vname: 'verify_infos',
          type: 'List (VerifyInfo)',
          value: params.map((arg) => ({
            constructor: 'VerifyInfo',
            argtypes: [
            ],
            arguments: [
              arg.userId,
              fromBech32Address(arg.zilAddress),
              arg.tweetId,
              arg.tags
            ]
          }))
        }
      ]
    });
    const zilTxData = zilliqa.transactions.new({
      data,
      nonce,
      version,
      toAddr: contract.address,
      pubKey: zilliqa.wallet.defaultAccount.publicKey,
      amount: new BN(0),
      gasPrice: new BN('2000000000'),
      gasLimit: Long.fromNumber(calcGasLimit)
    });
    const { txParams } = await zilliqa.wallet.sign(zilTxData);
    const tx = await zilliqa.provider.send(
      RPCMethod.CreateTransaction,
      txParams
    );

    if (tx.error && tx.error.message.includes(`Nonce (${nonce}) lower than current`)) {
      const accResult = await this.getCurrentAccount(account.address);

      account.update({
        nonce: accResult.nonce,
        balance: accResult.balance
      });
    }
    if (tx.error && tx.error.message) {
      throw new Error(tx.error.message);
    }

    await account.update({ nonce });

    return tx.result;
  },
  async getCurrentAccount(address) {
    const zilliqa = new Zilliqa(httpNode);

    try {
      const { result } = await zilliqa.blockchain.getBalance(address);

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
    const count = await Admin.count();

    for (let index = count; index < Number(amount); index++) {
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
  },
  async blockSubscribe(cb) {
    const zilliqa = new Zilliqa(httpNode);

    const subscriber = zilliqa.subscriptionBuilder.buildNewBlockSubscriptions(
      wsNode
    );

    subscriber.emitter.on(StatusType.SUBSCRIBE_NEW_BLOCK, (event) => {
      //
    });

    subscriber.emitter.on(MessageType.NEW_BLOCK, (event) => {
      cb(event.value.TxBlock.header);
    });

    return await subscriber.start()
  },
  async eventSubscribe(cb, subscribed = () => null) {
    const zilliqa = new Zilliqa(httpNode);
    const subscriber = zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
      wsNode,
      {
        addresses: [
          fromBech32Address(CONTRACT_ADDRESS)
        ]
      }
    );

    subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG, (event) => {
      subscribed(event);
    });

    subscriber.emitter.on(MessageType.EVENT_LOG, (event) => {
      if (!event || !event.value || !event.value[0]) {
        return null;
      }

      const contract = event.value.find(
        (value) => toChecksumAddress(value.address) === fromBech32Address(CONTRACT_ADDRESS)
      );

      if (!contract || !contract.event_logs) {
        return null;
      }

      contract.event_logs.forEach((log) => {
        cb(log);
      });
    });

    await subscriber.start();
  },
  async version() {
    const zilliqa = new Zilliqa(httpNode);
    const { result } = await zilliqa.network.GetNetworkId();

    return bytes.pack(result, MSG_VERSION);
  }
};
