// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

import { Events } from 'config';

export interface User {
  id?: number;
  username: string;
  screenName: string;
  profileImageUrl: string;
  zilAddress: string;
  jwtToken: string;
  message?: string;
}

export interface FetchUpdateAddress {
  address: string;
  jwt: string;
}

export interface Twitte {
  id?: number;
  id_str: string;
}

export interface Contract {
  contract: string;
  owner: string;
  hashtag: string;
  zilsPerTweet: string;
  blocksPerDay: string;
  blocksPerWeek: string;
}

export interface Blockchain {
  CurrentDSEpoch: string;
  CurrentMiniEpoch: string;
  DSBlockRate: number;
  NumDSBlocks: string;
  NumPeers: number;
  NumTransactions: string;
  NumTxBlocks: string;
  NumTxnsDSEpoch: string;
  NumTxnsTxEpoch: string;
}

export interface PageProp {
  user: User;
  contract: Contract;
  blockchain: Blockchain;
}

export interface EventState {
  current: Events;
}
