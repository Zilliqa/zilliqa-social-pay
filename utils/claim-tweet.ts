import fetch from 'isomorphic-unfetch';
import { APIs, HttpMethods, Errors } from 'config';
import { Twitte } from 'interfaces';

export const claimTweet = async (jwt: string, tweet: Twitte) => {
  if (!jwt || jwt.length < 1) {
    throw new Error(Errors.JWT_IS_NULL);
  }

  const res = await fetch(APIs.claimTweet, {
    method: HttpMethods.PUT,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwt
    },
    body: JSON.stringify(tweet)
  });
  const result = await res.json();

  return result;
};
