import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods } from 'config';

export const fetchSignOut = async () => {
  const res = await fetch(APIs.singOut, {
    method: HttpMethods.PUT,
    credentials: 'include',
  });
  const result = await res.json();

  return result;
};
