require('dotenv').config();

const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { validation, BN, Long, bytes, units } = require('@zilliqa-js/util');
const {
  toBech32Address,
  fromBech32Address,
  toChecksumAddress
} = require('@zilliqa-js/crypto');
const models = require('./models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDERS = {
  mainnet: 'https://dev-api.zilliqa.com',
  testnet: 'https://dev-api.zilliqa.com'
};
const ENV = process.env.NODE_ENV;
const CHAIN_ID = 333;
const MSG_VERSION = 1;
const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);
const PRIVATE_KEYS = JSON.parse(process.env.ADMIN_PRIVATE_KEY);

let httpNode = PROVIDERS.mainnet;

if (ENV !== 'production') {
  httpNode = PROVIDERS.testnet;
}

const zilliqa = new Zilliqa(httpNode);
const contract = zilliqa.contracts.at(CONTRACT_ADDRESS);

PRIVATE_KEYS.forEach((key) => zilliqa.wallet.addByPrivateKey(key));

if (!validation.isBech32(CONTRACT_ADDRESS)) {
  throw new Error('contract address: ', CONTRACT_ADDRESS, 'must be Bech32 format.');
}

async function checkAdmins() {
  const { admins } = await contract.getSubState('admins');

  if (Object.keys(admins).length > Object.keys(zilliqa.wallet.accounts).length) {
    throw new Error(`Contract has ${Object.keys(admins).length} admins but use ${Object.keys(zilliqa.wallet.accounts).length}`);
  }

  Object.keys(admins).forEach((acc) => {
    const address = toChecksumAddress(acc);

    if (!(address in zilliqa.wallet.accounts)) {
      throw new Error(`Account ${acc} is not addmin `);
    }
  });
};

checkAdmins();

module.exports = {
  async getInit() {
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
    const result = await contract.getSubState('verified_tweets', [tweetsID]);
    
    if (!result) {
      return {
        not_verified_tweets: tweetsID
      };
    }

    return result;
  },
  async blockchainInfo() {
    const { result } = await zilliqa.blockchain.getBlockChainInfo();

    return result;
  },
  async configureUsers(profileId, address, nonce) {
    if (validation.isBech32(address)) {
      address = fromBech32Address(address);
    }

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
    const tx = await contract.call('ConfigureUsers', params, {
      nonce,
      version: VERSION,
      amount: new BN(0),
      gasPrice: units.toQa('1000', units.Units.Li),
      gasLimit: Long.fromNumber(25000)
    });

    if (tx.id && tx.receipt['event_logs'] && tx.receipt['event_logs'][0]['_eventname'] !== 'ConfiguredUserAddress') {
      throw new Error(tx.receipt['event_logs'][0]['_eventname']);
    } else if (!tx.id) {
      throw new Error('Tx has not confirmed.');
    }

    return tx;
  },
  async verifyTweet(data, nonce) {
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
    const tx = await contract.call('VerifyTweet', params, {
      nonce,
      version: VERSION,
      amount: new BN(0),
      gasPrice: units.toQa('1000', units.Units.Li),
      gasLimit: Long.fromNumber(25000)
    });

    return tx;
  },
  async depositToContract() {
    const tx = await contract.call('Deposit', [], {
      version: VERSION,
      amount: new BN(units.toQa('10000', units.Units.Zil)),
      gasPrice: new BN('1000000000'),
      gasLimit: Long.fromNumber(1000)
    });

    return tx;
  },
  async getCurrentAccount(address = zilliqa.wallet.defaultAccount.address) {
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
  }
};
