export const API_V1 = '/api/v1';
export const NUMBER_OF_TWEETS = 200;

export enum Methods {
  update = 'update',
  auth = 'auth',
  get = 'get',
  search = 'search',
  sing = 'sing',
  add = 'add',
  claim = 'claim',
  delete = 'delete'
}

export const APIs = {
  updateAddress: `${API_V1}/${Methods.update}/address`,
  singOut: `${API_V1}/${Methods.sing}/out`,
  twitterAuth: `${API_V1}/${Methods.auth}/twitter`,
  twitterAuthReverse: `${API_V1}/${Methods.auth}/twitter/reverse`,
  getTweets: `${API_V1}/${Methods.get}/tweets`,
  rmTweet: `${API_V1}/${Methods.delete}/tweete`,
  tweetsUpdate: `${API_V1}/${Methods.update}/tweets`,
  searchTweet: `${API_V1}/${Methods.search}/tweets`,
  getblockchain: `${API_V1}/${Methods.get}/blockchain`,
  getAccount: `${API_V1}/${Methods.get}/account`,
  addTweet: `${API_V1}/${Methods.add}/tweet`,
  claimTweet: `${API_V1}/${Methods.claim}/tweet`,
  getNotifications: `${API_V1}/${Methods.get}/notifications`,
  rmNotifications: `${API_V1}/${Methods.delete}/notifications`
};
