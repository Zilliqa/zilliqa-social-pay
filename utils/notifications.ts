import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods } from 'config';

import { Paginate } from 'interfaces';

/**
 * Get all notifications by user.
 */
export const fetchNotifications = async ({
  offset = 0,
  limit
}: Paginate) => {
  const res = await fetch(`${APIs.getNotifications}?limit=${limit}&offset=${offset}`, {
    credentials: 'include'
  });
  const result = await res.json();

  return result;
};

/**
 * Remove all notifications by user.
 * @param jwt - User jwt token.
 */
export const removeAllNotifications = async (jwt: string) => {
  const res = await fetch(`${APIs.rmNotifications}`, {
    method: HttpMethods.DELETE,
    credentials: 'include',
    headers: {
      Authorization: jwt
    }
  });
  const result = await res.json();

  return result;
};
