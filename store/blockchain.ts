import { createDomain } from 'effector';

import { Blockchain } from 'interfaces';
import { fetchBlockchainData } from 'utils/get-blockchain';

export const blockchainDomain = createDomain();
export const updateBlockchain = blockchainDomain.effect<null, Blockchain, Error>();

updateBlockchain.use(fetchBlockchainData);

const initalState: Blockchain = {
  contract: null,
  hashtag: null,
  zilsPerTweet: '0',
  blocksPerDay: 0,
  blocksPerWeek: 0,
  BlockNum: 0,
  DSBlockNum: 0
};

export const store = blockchainDomain.store<Blockchain>(initalState)
  .on(updateBlockchain.done, (state, { result }) => ({
    ...state,
    ...result
  }));

export default {
  store,
  updateBlockchain
};
