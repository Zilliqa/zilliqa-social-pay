import { v4 as uuidv4 } from 'uuid';
import { createDomain } from 'effector';

import {
  NotificationState,
  NotificationModel,
  NotificationResponse,
  Paginate,
  ErrorResponse
} from 'interfaces';
import { fetchNotifications, removeAllNotifications } from 'utils/notifications';
import { toUnique } from 'utils/to-unique';

export const EventDomain = createDomain();
export const addNotifly = EventDomain.event<JSX.Element>();
export const clearNotification = EventDomain.event();
export const addServerNotification = EventDomain.event<NotificationModel>();
export const addLoadingNotifly = EventDomain.event<JSX.Element>();
export const rmNotifly = EventDomain.event<string>();
export const getNotifications = EventDomain.effect<Paginate, NotificationResponse, Error>();
export const removeNotifications = EventDomain.effect<string, string | ErrorResponse, Error>();

getNotifications.use(fetchNotifications);
removeNotifications.use(removeAllNotifications);

const initalState = {
  notifications: [],
  serverNotifications: [],
  timeoutTransition: 400,
  timeoutNotifications: 5000,
  loadinguiid: uuidv4(),
  count: 0,
  limit: 0
};

export const store = EventDomain.store<NotificationState>(initalState)
  .on(clearNotification, (state) => ({
    ...state,
    notifications: [],
    serverNotifications: []
  }))
  .on(addNotifly, (state, component) => {
    const { notifications } = state;
    const notification = {
      element: component,
      uuid: uuidv4()
    };

    notifications.push(notification);

    setTimeout(
      () => rmNotifly(notification.uuid),
      state.timeoutNotifications
    );

    return {
      ...state,
      notifications
    };
  })
  .on(addLoadingNotifly, (state, component) => {
    const { notifications } = state;
    const notification = {
      element: component,
      uuid: state.loadinguiid
    };
    const hasDublicate = notifications.some(
      (el) => el.uuid === state.loadinguiid
    );

    if (!hasDublicate) {
      notifications.push(notification);
    }

    return {
      ...state,
      notifications
    };
  })
  .on(rmNotifly, (state, uuid) => ({
    ...state,
    notifications: state.notifications.filter(
      (el) => el.uuid !== uuid
    )
  }))
  .on(getNotifications.done, (state, { result }) => {
    if (!result || !Array.isArray(result.notification)) {
      return state;
    }

    const serverNotifications = toUnique(
      state.serverNotifications.concat(result.notification),
      'id'
    );

    return {
      ...state,
      serverNotifications,
      count: result.count,
      limit: result.limit
    };
  })
  .on(removeNotifications, (state) => ({
    ...state,
    count: 0,
    serverNotifications: []
  }))
  .on(addServerNotification, (state, serverNotification) => ({
    ...state,
    count: state.count + 1,
    serverNotifications: [serverNotification].concat(state.serverNotifications)
  }));

export default {
  store,
  addNotifly,
  addLoadingNotifly,
  rmNotifly,
  getNotifications,
  removeNotifications,
  clearNotification,
  addServerNotification
};
