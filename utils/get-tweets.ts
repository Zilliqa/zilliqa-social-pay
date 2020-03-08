import fetch from 'isomorphic-unfetch';

import { APIs } from 'config';

export const fetchTweets = async () => {
  const res = await fetch(APIs.getTweets);
  const result = await res.json();

  return result;
};
