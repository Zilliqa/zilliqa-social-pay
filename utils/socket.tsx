import io from 'socket.io-client';

import UserStore from 'store/user';
import BlockchainStore from 'store/blockchain';
import NotificationStore from 'store/notification';
import TwitterStore from 'store/twitter';

import { NotificationSuccess, NotificationDanger } from 'components/notification-control';
import { Img } from 'components/img';

import EVENTS from 'config/socket-events';
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

    if (user.synchronization === false && userSate.synchronization === true) {
      // If address was synchronization this is show Notification about
      // address has synchronized.
      NotificationStore.addNotifly(
        <NotificationSuccess>
          <Img
            src="/icons/ok.svg"
            css="margin-right: 10px;"
          />
            Address configured!
          </NotificationSuccess>
      );
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

    if (tweet.approved) {
      NotificationStore.addNotifly(
        <NotificationSuccess>
          <Img
            src="/icons/ok.svg"
            css="margin-right: 10px;"
          />
          Rewards claimed!
        </NotificationSuccess>
      );
      UserStore.updateUserState(null);
    } else if (tweet.rejected) {
      NotificationStore.addNotifly(
        <NotificationDanger>
          <Img
            src="/icons/close.svg"
            css="margin-right: 10px;"
          />
          Rewards rejected!
        </NotificationDanger>
      );
    }
  });

  socketConnector.on(EVENTS.notificationCreate, (data: string) => {
    const notification = JSON.parse(data) as NotificationModel;
    console.log(notification);
  });
}
