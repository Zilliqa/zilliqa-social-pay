export const API_V1 = '/api/v1';

export enum Methods {
  update = 'update',
  auth = 'auth'
}

export const APIs = {
  updateAddress: `${API_V1}/${Methods.update}/address`,
  twitterAuth: `${API_V1}/${Methods.auth}/twitter`,
  twitterAuthReverse: `${API_V1}/${Methods.auth}/twitter/reverse`
};
