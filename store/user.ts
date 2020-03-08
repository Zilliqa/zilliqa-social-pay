import { createDomain } from 'effector';

import { User, FetchUpdateAddress } from 'interfaces';
import { LocalStorageKeys } from 'config';
import { fetchUpdateAddress } from 'utils/user-api';

export const UserDomain = createDomain();
export const setUser = UserDomain.event<User>();
export const update = UserDomain.event();

export const updateAddress = UserDomain.effect<FetchUpdateAddress, User, Error>();

updateAddress.use(fetchUpdateAddress);

const initalState: User = {
  username: '',
  screenName: '',
  profileImageUrl: '',
  zilAddress: '',
  jwtToken: ''
};

export const store = UserDomain.store<User>(initalState)
  .on(setUser, (state, user) => {
    const storage = window.localStorage;
    const updated = {
      ...state,
      ...user
    };

    storage.setItem(LocalStorageKeys.user, JSON.stringify(updated));

    return updated;
  })
  .on(update, () => {
    const storage = window.localStorage;
    const userAsString = storage.getItem(LocalStorageKeys.user);

    if (!userAsString) {
      return {};
    }

    return JSON.parse(userAsString) || {};
  })
  .on(updateAddress.done, (state, { result }) => {
    return {
      ...state,
      zilAddress: result.zilAddress
    };
  });

export default {
  store,
  update,
  setUser,
  updateAddress
};
