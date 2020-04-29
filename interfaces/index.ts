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
  claimed: boolean;
  txId: string;
  block: string | number;
  createdAt: string;
  updatedAt: string;
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
  balance: string | number;
  initBalance: string | number;
  message?: string;
}

export interface PageProp {
  user?: User | null;
  firstStart: boolean;
}

export interface EventState {
  current: Events;
  content: null | any;
  timer?: string | null;
}

export interface NotificationState {
  notifications: {
    element: JSX.Element,
    uuid: string;
  }[];
  timeoutTransition: number;
  timeoutNotifications: number;
}


export interface FetchTweets {
  tweets: Twitte[];
  count: number;
  verifiedCount: number;
}
