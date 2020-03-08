// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export interface User {
  id?: number;
  username: string;
  screenName: string;
  profileImageUrl: string;
  zilAddress: string;
  jwtToken: string;
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

export interface PageProp {
  user: User;
  contract: Contract;
}
