import io from 'socket.io-client';

import UserStore from 'store/user';
import BlockchainStore from 'store/blockchain';
import NotificationStore from 'store/notification';
import TwitterStore from 'store/twitter';

import {
  NotificationWarning,
  NotificationSuccess,
  NotificationDanger
} from 'components/notification-control';
import { Img } from 'components/img';
import { MinLoader } from 'components/min-loader';

import EVENTS from 'config/socket-events';
import NOTIFICATIONS_TYPES from 'config/notifications-types';
import { Twitte, User, NotificationModel } from 'interfaces';

export function socket() {
  let userSate = UserStore.store.getState();

  if (!userSate.jwtToken || userSate.jwtToken.length < 1) {
    throw new Error('JWT must be required.');
  }

  const socketConnector = io();

  socketConnector.id = userSate.profileId;

  /**
   * Zilliqa blockchain updater.
   * When new block has created, then server send information about new block.
   */
  socketConnector.on(EVENTS.info, (data: string) => {
    BlockchainStore.updateStore(JSON.parse(data));
  });

  /**
   * Watching any user update.
   */
  socketConnector.on(EVENTS.userUpdated, (data: string) => {
    userSate = UserStore.store.getState();
    const user = JSON.parse(data) as User;

    if (user.profileId !== userSate.profileId) {
      return null;
    }

    UserStore.setUser(user);
  });

  /**
   * Watching any tweetes update.
   * If tweet had been confirmed or rejected then
   * show user notification.
   */
  socketConnector.on(EVENTS.tweetsUpdate, (data: string) => {
    const tweet = JSON.parse(data) as Twitte;
    const tweetsState = TwitterStore.store.getState();
    const foundIndex = tweetsState.tweets.findIndex((t) => t.idStr === tweet.idStr);

    if (foundIndex < 0) {
      return null;
    } else if (JSON.stringify(tweetsState.tweets[foundIndex]) === data) {
      return null;
    }

    tweetsState.tweets[foundIndex] = tweet;

    TwitterStore.update(tweetsState.tweets);
    TwitterStore.setLastBlock(tweet.block);
    BlockchainStore.updateTimer();
  });

  socketConnector.on(EVENTS.notificationCreate, (data: string) => {
    const notification = JSON.parse(data) as NotificationModel;

    const notificationsState = NotificationStore.store.getState();
    const has = notificationsState.serverNotifications.some(
      (notifly) => notifly.id === notification.id
    );

    if (has) {
      return null;
    }

    NotificationStore.addServerNotification(notification);

    switch (notification.type) {
      case NOTIFICATIONS_TYPES.addressConfiguring:
        NotificationStore.addLoadingNotifly(
          <NotificationWarning>
            <MinLoader height="40" width="40" />
            {notification.description}
          </NotificationWarning>
        );
        break;
      case NOTIFICATIONS_TYPES.addressConfigured:
        NotificationStore.rmNotifly(notificationsState.loadinguiid);
        NotificationStore.addNotifly(
          <NotificationSuccess>
            <Img
              src="/icons/ok.svg"
              css="height: 30px;width: 30px;"
            />
            {notification.description}
          </NotificationSuccess>
        );
        break;
      case NOTIFICATIONS_TYPES.addressReject:
        NotificationStore.rmNotifly(notificationsState.loadinguiid);
        NotificationStore.addNotifly(
          <NotificationDanger>
            <Img
              src="/icons/close.svg"
              css="height: 30px;width: 30px;"
            />
            {notification.description}
          </NotificationDanger>
        );
        break;

      case NOTIFICATIONS_TYPES.tweetClaiming:
        NotificationStore.addLoadingNotifly(
          <NotificationWarning>
            <MinLoader height="40" width="40" />
            {notification.description}
          </NotificationWarning>
        );
        break;
      case NOTIFICATIONS_TYPES.tweetClaimed:
        NotificationStore.rmNotifly(notificationsState.loadinguiid);
        NotificationStore.addNotifly(
          <NotificationSuccess>
            <Img
              src="/icons/ok.svg"
              css="height: 30px;width: 30px;"
            />
            {notification.description}
          </NotificationSuccess>
        );
        break;
      case NOTIFICATIONS_TYPES.tweetReject:
        NotificationStore.rmNotifly(notificationsState.loadinguiid);
        NotificationStore.addNotifly(
          <NotificationDanger>
            <Img
              src="/icons/close.svg"
              css="height: 30px;width: 30px;"
            />
            {notification.description}
          </NotificationDanger>
        );
        break;

      default:
        break;
    }
  });
}
