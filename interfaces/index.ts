// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';

export interface User {
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
