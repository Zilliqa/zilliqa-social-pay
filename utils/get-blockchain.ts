import fetch from 'isomorphic-unfetch';

import { APIs } from 'config';

export const fetchBlockchainData = async () => {
  const res = await fetch(APIs.getblockchain, {
    credentials: 'include'
  });
  const result = await res.json();

  return result;
};
