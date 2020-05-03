import fetch from 'isomorphic-unfetch';

import { APIs, HttpMethods } from 'config';

/**
 * Get all notifications by user.
 */
export const fetchNotifications = async () => {
  const res = await fetch(`${APIs.getNotifications}`, {
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