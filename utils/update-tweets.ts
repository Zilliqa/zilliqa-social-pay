import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods, Errors } from 'config';

export const fetchTweetsUpdate = async (jwt: string) => {
  if (!jwt || jwt.length < 1) {
    throw new Error(Errors.JWT_IS_NULL);
  }

  const res = await fetch(APIs.tweetsUpdate, {
    method: HttpMethods.PUT,
    headers: {
      Authorization: jwt
    }
  });
  const result = await res.json();

  return result;
};

export const addTweet = async (jwt: string, tweet: object) => {
  if (!jwt || jwt.length < 1) {
    throw new Error(Errors.JWT_IS_NULL);
  }

  const res = await fetch(APIs.addTweet, {
    method: HttpMethods.POST,
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwt
    },
    body: JSON.stringify(tweet)
  });
  const result = await res.json();

  return result;
};
