import { createDomain } from 'effector';
import moment from 'moment';

import { Blockchain } from 'interfaces';
import UserStore from 'store/user';
import twitterStore from 'store/twitter';
import { fetchBlockchainData } from 'utils/get-blockchain';
import { timerCalc } from 'utils/timer';

export const blockchainDomain = createDomain();
export const updateStore = blockchainDomain.event<Blockchain>();
export const updateTimer = blockchainDomain.event();
export const updateBlockchain = blockchainDomain.effect<null, Blockchain, Error>();

updateBlockchain.use(fetchBlockchainData);

const getTime = (blockchain: Blockchain) => {
  const userState = UserStore.store.getState();
  const twitterState = twitterStore.store.getState();
  const week = timerCalc(
    blockchain,
    twitterState.lastBlockNumber,
    Number(blockchain.blocksPerWeek),
    userState.lastAction
  );
  const day = timerCalc(
    blockchain,
    twitterState.lastBlockNumber,
    Number(blockchain.blocksPerDay)
  );

  const dayTimer = day !== 0 ? moment(day).fromNow() : null;
  const weekTimer = week !== 0 ? moment(week).fromNow() : null;

  return {
    dayTimer,
    weekTimer
  };
};

const initalState: Blockchain = {
  contract: null,
  hashtag: null,
  zilsPerTweet: '0',
  blocksPerDay: 0,
  blocksPerWeek: 0,
  BlockNum: 0,
  DSBlockNum: 0,
  rate: 0,
  balance: 0,
  initBalance: 0,
  campaignEnd: null,
  now: null
};

export const store = blockchainDomain.store<Blockchain>(initalState)
  .on(updateStore, (state, newState) => ({
    ...state,
    ...newState,
    ...getTime(newState)
  }))
  .on(updateBlockchain.done, (state, { result }) => ({
    ...state,
    ...result,
    ...getTime(result)
  }))
  .on(updateTimer, (state) => ({
    ...state,
    ...getTime(state)
  }));

export default {
  store,
  updateBlockchain,
  updateStore,
  updateTimer
};
