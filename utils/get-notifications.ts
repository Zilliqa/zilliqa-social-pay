import fetch from 'isomorphic-unfetch';

import { APIs } from 'config';

export const fetchNotifications = async () => {
  const res = await fetch(`${APIs.getNotifications}`, {
    credentials: 'include'
  });
  const result = await res.json();

  return result;
};
