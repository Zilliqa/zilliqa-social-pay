import io from 'socket.io-client';

import UserStore from 'store/user';
import EVENTS from 'config/socket-events';

export function socket() {
  const userSate = UserStore.store.getState();

  if (!userSate.jwtToken || userSate.jwtToken.length < 1) {
    throw new Error('JWT must be required.');
  }

  const socketConnector: SocketIOClient.Socket = io();

  socketConnector.emit(EVENTS.info, userSate.jwtToken);

  console.log(socketConnector);

  socketConnector.on(EVENTS.info, (data: string) => {
    console.log(data);
  });
}
