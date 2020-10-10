import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods, Errors } from 'config';
import { Twitte } from 'interfaces';

export const fetchTweetsUpdate = async (jwt: string) => {
  if (!jwt || jwt.length < 1) {
    throw new Error(Errors.JWT_IS_NULL);
  }

  const res = await fetch(APIs.tweetsUpdate, {
    method: HttpMethods.PUT,
    credentials: 'include',
    headers: {
      Authorization: jwt
    }
  });
  const result = await res.json();

  return result;
};

export const addTweet = async (body: { tweete: Twitte; jwt: string; }) => {
  if (!body.jwt || body.jwt.length < 1) {
    throw new Error(Errors.JWT_IS_NULL);
  }

  const res = await fetch(APIs.addTweet, {
    method: HttpMethods.POST,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: body.jwt
    },
    body: JSON.stringify(body.tweete)
  });
  const result = await res.json();

  return result;
};
