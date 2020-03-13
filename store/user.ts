import { createDomain } from 'effector';
import { NotificationManager } from 'react-notifications';
import { validation } from '@zilliqa-js/util';

import { User, FetchUpdateAddress } from 'interfaces';
import { LocalStorageKeys } from 'config';
import { fetchUpdateAddress, fetchUserData } from 'utils/user-api';

export const UserDomain = createDomain();
export const setUser = UserDomain.event<User>();
export const update = UserDomain.event();
export const clear = UserDomain.event();

export const updateAddress = UserDomain.effect<FetchUpdateAddress, User, Error>();
export const updateUserState = UserDomain.effect<null, User, Error>();

updateAddress.use(fetchUpdateAddress);
updateUserState.use(fetchUserData);

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
    const storage = window.localStorage;
    const newState = {
      ...state,
      zilAddress: result.zilAddress
    };

    storage.setItem(LocalStorageKeys.user, JSON.stringify(newState));

    return newState;
  })
  .on(clear, () => {
    window.localStorage.clear();

    return initalState;
  })
  .on(updateUserState.done, (state, { result }) => {
    const storage = window.localStorage;
    const updated = {
      ...state,
      ...result
    };

    try {
      if (validation.isBech32(result.zilAddress) && (state.zilAddress !== result.zilAddress)) {
        NotificationManager.success('Your Zilliqa Address has been configured!');
      }
    } catch (err) {
      // Skip
    }

    storage.setItem(LocalStorageKeys.user, JSON.stringify(updated));

    return updated;
  });

export default {
  store,
  update,
  setUser,
  updateAddress,
  clear,
  updateUserState
};
