import { createDomain } from 'effector';

import { Blockchain } from 'interfaces';
import { fetchBlockchainData } from 'utils/get-blockchain';

export const blockchainDomain = createDomain();
export const nextBlock = blockchainDomain.event();
export const updateStore = blockchainDomain.event<Blockchain>();
export const updateBlockchain = blockchainDomain.effect<null, Blockchain, Error>();

updateBlockchain.use(fetchBlockchainData);

const initalState: Blockchain = {
  contract: null,
  hashtag: null,
  zilsPerTweet: '0',
  blocksPerDay: 0,
  blocksPerWeek: 0,
  BlockNum: 0,
  DSBlockNum: 0,
  rate: 0
};

export const store = blockchainDomain.store<Blockchain>(initalState)
  .on(updateStore, (state, newState) => ({ ...state, ...newState }))
  .on(updateBlockchain.done, (state, { result }) => ({
    ...state,
    ...result
  }))
  .on(nextBlock, (state) => ({
    ...state,
    BlockNum: Number(state.BlockNum) + 1
  }));

export default {
  store,
  updateBlockchain,
  nextBlock,
  updateStore
};
