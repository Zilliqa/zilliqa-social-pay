import { createDomain } from 'effector';

import { User } from 'interfaces';
import { LocalStorageKeys } from 'config';

export const AppSettingsDomain = createDomain();
export const setUser = AppSettingsDomain.event<User>();
export const update = AppSettingsDomain.event();

const initalState: User | object = {};

export const store = AppSettingsDomain.store<User | object>(initalState)
  .on(setUser, (state, user) => {
    const storage = window.localStorage;
    const updated = {
      ...state,
      ...user
    };

    storage.setItem(LocalStorageKeys.user, JSON.stringify(updated));

    return updated;
  })
  .on(update, (state) => {
    const storage = window.localStorage;
    const userAsString = storage.getItem(LocalStorageKeys.user);

    if (!userAsString) {
      return {};
    }

    const user = JSON.parse(userAsString) || {};

    return {
      ...state,
      ...user
    };
  });

export default {
  store,
  update,
  setUser
};
