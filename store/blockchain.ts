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
    0,
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
  now: null,
  hashtagText: 'I’m supporting this campaign (https://redcross.give.asia/campaign/essentials-delivered-to-migrant-workers/) to raise funds for migrant workers suffering due to #COVID__19. Please help donate to this cause or share this message, thank you! @SGRedCross @Zilliqa @NextIDsg'
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
