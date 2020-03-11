import { createDomain } from 'effector';

import { fetchTweetsUpdate } from 'utils/update-tweets';
import { fetchTweets } from 'utils/get-tweets';

import { Twitte } from 'interfaces';

export const TwitterDomain = createDomain();
export const update = TwitterDomain.event<any[]>();
export const getTweets = TwitterDomain.effect<null, any[] | any, Error>();

export const updateTweets = TwitterDomain.effect<string, any[], Error>();

updateTweets.use(fetchTweetsUpdate);
getTweets.use(fetchTweets);

const initalState: { error?: boolean; tweets: Twitte[]; } = {
  error: undefined,
  tweets: []
};

export const store = TwitterDomain.store(initalState)
  .on(update, (state, tweets) => ({ ...state, tweets }))
  .on(updateTweets.done, (state, { result }) => {
    if (Array.isArray(result) && result.length > 0) {
      return {
        error: undefined,
        tweets: result
      };
    }

    return {
      ...state,
      error: true
    };
  })
  .on(getTweets.done, (state, { result }) => {
    if (Array.isArray(result) && result.length > 0) {
      return {
        error: undefined,
        tweets: result
      };
    }

    return {
      ...state,
      error: true
    };
  });

export default {
  store,
  update,
  updateTweets,
  getTweets
};
