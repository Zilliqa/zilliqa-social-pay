import { createDomain } from 'effector';

import { User, FetchUpdateAddress, ErrorResponse } from 'interfaces';
import { LocalStorageKeys } from 'config';
import { fetchUpdateAddress, fetchUserData } from 'utils/user-api';

export const UserDomain = createDomain();
export const setUser = UserDomain.event<User>();
export const setJWT = UserDomain.event<string>();
export const getJWT = UserDomain.event();
export const clear = UserDomain.event();

export const updateAddress = UserDomain.effect<FetchUpdateAddress, {
  message: string;
  code: number;
  user: User;
}, ErrorResponse>();
export const updateUserState = UserDomain.effect<null, User, ErrorResponse>();

updateAddress.use(fetchUpdateAddress);
updateUserState.use(fetchUserData);

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
  updated: false,
  hash: null
};

export const store = UserDomain.store<User>(initalState)
  .on(setUser, (state, user) => {
    const updated = {
      ...state,
      ...user
    };

    return updated;
  })
  .on(setJWT, (state, jwtToken) => {
    const storage = window.localStorage;

    storage.clear();
    storage.setItem(LocalStorageKeys.user, JSON.stringify({
      jwtToken
    }));

    return {
      ...state,
      jwtToken
    };
  })
  .on(getJWT, (state) => {
    const storage = window.localStorage;
    const userAsString = storage.getItem(LocalStorageKeys.user);

    if (!userAsString) {
      return {
        ...state,
        jwtToken: ''
      };
    }

    const stateFromStorage = JSON.parse(userAsString);

    return {
      ...state,
      jwtToken: stateFromStorage.jwtToken || '',
      updated: true
    };
  })
  .on(updateAddress.done, (state, { result }) => {
    if (!result.user) {
      return state;
    }

    const newState = {
      ...result.user,
      jwtToken: state.jwtToken,
      updated: true
    };

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

    const updated = {
      ...result,
      jwtToken: state.jwtToken,
      updated: true
    };

    return updated;
  });

export default {
  store,
  setUser,
  getJWT,
  setJWT,
  updateAddress,
  clear,
  updateUserState
};
