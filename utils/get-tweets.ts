import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods } from 'config';

export const fetchTweets = async () => {
  const res = await fetch(APIs.getTweets);
  const result = await res.json();

  return result;
};

export const SearchTweet = async (query: string, jwt: string) => {
  const res = await fetch(`${APIs.searchTweet}/${query}`, {
    method: HttpMethods.POST,
    headers: {
      Authorization: jwt
    }
  });
  const result = await res.json();

  return result;
};
