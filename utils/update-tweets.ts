import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods } from 'config';

export const fetchTweetsUpdate = async (jwt: string) => {
  if (!jwt || jwt.length < 1) {
    throw new Error('JWT token is required');
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
