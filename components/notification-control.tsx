import styled from 'styled-components';
import { createComponent } from 'effector-react';

import NotificationStore from 'store/notification';

import { FontColors } from 'config';

export const NotificationList = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 99;

  display: grid;
  grid-gap: 15px;
`;
export const Notification = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;

  padding: 10px;

  box-sizing: border-box;

  min-width: 200px;
  min-height: 50px;

  box-shadow:0 0 12px #999;
  text-shadow: 0 0 0.5em ${FontColors.white};
  border-radius: 5px;

  cursor: pointer;
  opacity: 0.9;
  user-select: none;
  font-size: 15px;

  animation-duration: .3s;
  animation-name: fadeInDown;
`;
export const NotificationDanger = styled(Notification)`
  background-color: ${FontColors.danger};
  color: ${FontColors.white};
  border: #c3453a 1px solid;
`;
export const NotificationWarning = styled(Notification)`
  background-color: ${FontColors.warning};
  color: ${FontColors.white};
`;
export const NotificationSuccess = styled(Notification)`
  background-color: ${FontColors.success};
  color: ${FontColors.white};
`;

export const NotificationsControl = createComponent(NotificationStore.store, (_, state) => (
  <NotificationList>
    {state.notifications.map((notifly) => (
      <div
        key={notifly.uuid}
        onClick={() => NotificationStore.rmNotifly(notifly.uuid)}
      >
        {notifly.element}
      </div>
    ))}
  </NotificationList>
));
