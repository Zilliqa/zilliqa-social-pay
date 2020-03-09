const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { validation } = require('@zilliqa-js/util');
const { toBech32Address } = require('@zilliqa-js/crypto');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDERS = {
  mainnet: 'https://api.zilliqa.com',
  textnet: 'https://dev-api.zilliqa.com'
};
const ENV = process.env.NODE_ENV;

let httpNode = PROVIDERS.mainnet;

if (ENV !== 'production') {
  httpNode = PROVIDERS.textnet;
}

const zilliqa = new Zilliqa(httpNode);

if (!validation.isBech32(CONTRACT_ADDRESS)) {
  throw new Error('contract address: ', CONTRACT_ADDRESS, 'must be Bech32 format.');
}

module.exports = {
  async getInit() {
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
      hashtag: hashtag.value,
      zilsPerTweet: zils_per_tweet.value,
      blocksPerDay: blocks_per_day.value,
      blocksPerWeek: blocks_per_week.value
    }
  },
  async blockchainInfo() {
    const { result } = await zilliqa.blockchain.getBlockChainInfo();

    return result;
  }
};
