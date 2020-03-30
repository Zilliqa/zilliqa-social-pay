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
  profileId: string;
  balance: string;
  lastAction: string;
  synchronization: boolean;
  updated: boolean;
  actionName?: string;
  hash: string | null;
}

export interface FetchUpdateAddress {
  address: string;
  jwt: string;
}

export interface Twitte {
  id?: number;
  idStr: string;
  text: string;
  approved: boolean;
  rejected: boolean;
  txId: string;
  block?: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  contract: string;
  owner: string;
  hashtag: string | null;
  zilsPerTweet: string;
  blocksPerDay: string;
  blocksPerWeek: string;
}

export interface Blockchain {
  contract: string | null;
  hashtag: string | null;
  zilsPerTweet: string;
  blocksPerDay: string | number;
  blocksPerWeek: string | number;
  BlockNum: string | number;
  DSBlockNum: string | number;
  rate: string | number;
  message?: string;
}

export interface PageProp {
  user?: User | null;
  firstStart: boolean;
}

export interface EventState {
  current: Events;
  content: null | any;
}
