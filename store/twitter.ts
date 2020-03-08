import { createDomain } from 'effector';

import { fetchTweets } from 'utils/get-tweets';

export const TwitterDomain = createDomain();
export const update = TwitterDomain.event<any>();

export const updateTweets = TwitterDomain.effect<null, any, Error>();

updateTweets.use(fetchTweets);

const initalState: any[] = [];

export const store = TwitterDomain.store<any[]>(initalState)
  .on(update, (state, payload) => ({ ...state, ...payload }))
  .on(updateTweets.done, (_, { result }) => result.statuses);

export default {
  store,
  update,
  updateTweets
};
