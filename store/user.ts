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

const addressHasConfigured = (user: User, state: User) => {
  try {
    if (validation.isBech32(user.zilAddress) && (state.synchronization !== user.synchronization)) {
      NotificationManager.success('Your Zilliqa Address has been configured!');
    }
  } catch (err) {
    // Skip
  }
};

const initalState: User = {
  username: '',
  screenName: '',
  profileImageUrl: '',
  zilAddress: '',
  jwtToken: '',
  balance: '0',
  synchronization: false,
  lastAction: '0',
  profileId: '',
  updated: false
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

    const stateFromStorage = JSON.parse(userAsString) || initalState;

    return {
      ...stateFromStorage,
      updated: true
    };
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
    if (!state.jwtToken) {
      return initalState;
    }

    const storage = window.localStorage;
    const updated = {
      ...state,
      ...result
    };

    addressHasConfigured(result, state);

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
