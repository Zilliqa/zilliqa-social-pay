import { createDomain } from 'effector';
import { NotificationManager } from 'react-notifications';

import { fetchTweetsUpdate } from 'utils/update-tweets';
import { fetchTweets } from 'utils/get-tweets';
import { toUnique } from 'utils/to-unique';
import { Twitte, FetchTweets } from 'interfaces';

export const TwitterDomain = createDomain();
export const update = TwitterDomain.event<Twitte[]>();
export const add = TwitterDomain.event<Twitte>();
export const clear = TwitterDomain.event();
export const getTweets = TwitterDomain.effect<{ limit?: number, offset?: number }, any[] | any, Error>();

export const updateTweets = TwitterDomain.effect<string, FetchTweets, Error>();

updateTweets.use(fetchTweetsUpdate);
getTweets.use(fetchTweets);

type InitState = {
  error?: boolean;
  lastBlockNumber: number | string;
} & FetchTweets;

const initalState: InitState = {
  error: undefined,
  tweets: [],
  count: 0,
  verifiedCount: 0,
  lastBlockNumber: 0
};

export const store = TwitterDomain.store(initalState)
  .on(update, (state, tweets) => ({
    ...state,
    tweets,
    verifiedCount: tweets.filter((el) => el.approved).length
  }))
  .on(updateTweets.done, (state, { result }) => {
    if (Array.isArray(result.tweets) && result.tweets.length > 0) {
      NotificationManager.info(`SocialPay has been found ${result.tweets.length} tweets.`);

      const tweets = toUnique(state.tweets.concat(result.tweets), 'idStr');

      return {
        ...state,
        tweets,
        error: undefined,
        count: tweets.length
      };
    }

    return {
      ...state
    };
  })
  .on(getTweets.done, (state, { result }) => {
    if (result && Array.isArray(result.tweets)) {
      return {
        error: undefined,
        tweets: state.tweets.concat(result.tweets),
        count: result.count,
        verifiedCount: result.verifiedCount,
        lastBlockNumber: result.lastBlockNumber
      };
    }

    return {
      ...state,
      error: true
    };
  })
  .on(clear, () => initalState)
  .on(add, (state, tweet) => ({
    ...state,
    tweets: state.tweets.concat([tweet]),
    count: state.count + 1,
    lastBlockNumber: tweet.block
  }));

export default {
  store,
  update,
  updateTweets,
  getTweets,
  clear,
  add
};
