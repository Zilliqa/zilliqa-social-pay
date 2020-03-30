import io from 'socket.io-client';
import { NotificationManager } from 'react-notifications';

import UserStore from 'store/user';
import BlockchainStore from 'store/blockchain';
import TwitterStore from 'store/twitter';

import EVENTS from 'config/socket-events';
import { Twitte } from 'interfaces';

export function socket() {
  const userSate = UserStore.store.getState();

  if (!userSate.jwtToken || userSate.jwtToken.length < 1) {
    throw new Error('JWT must be required.');
  }

  const socketConnector = io();

  socketConnector.id = userSate.profileId;

  socketConnector.on(EVENTS.info, (data: string) => {
    BlockchainStore.updateBlockchain(JSON.parse(data));
  });
  socketConnector.on(EVENTS.userUpdated, (data: string) => {
    const user = JSON.parse(data);

    if (user.profileId === userSate.profileId && JSON.stringify(userSate) !== data) {

      if (user.synchronization && !userSate.synchronization && user.actionName === 'ConfigureUsers') {
        NotificationManager.success('Address configured');
      }

      UserStore.setUser(user);
    }
  });
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
      NotificationManager.success('Your tweet is confirmed.');
    } else if (tweet.rejected) {
      NotificationManager.success('Your tweet is rejected.');
    }
  });
}
