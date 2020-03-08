import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods } from 'config';

export const fetchTweetsUpdate = async (jwt: string) => {
  const res = await fetch(APIs.tweetsUpdate, {
    method: HttpMethods.PUT,
    headers: {
      Authorization: jwt
    }
  });
  const result = await res.json();

  return result;
};
