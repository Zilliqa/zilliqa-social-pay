import React from 'react';
import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';
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

  box-sizing: border-box;

  min-width: 200px;
  min-height: 50px;
  max-height: calc(100% - 30px);

  overflow-x: hidden;
  overflow-y: auto;

  box-shadow:0 0 12px #999;
  border-radius: 2px;

  cursor: pointer;
  opacity: 0.9;
  user-select: none;

  animation-duration: .3s;
  animation-name: fadeInDown;
`;
export const NotificationDanger = styled(Notification)`
  background-color: ${FontColors.danger};
  color: ${FontColors.white};
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
      <CSSTransition
        key={notifly.uuid}
        timeout={state.timeoutTransition}
      >
        {notifly.element}
      </CSSTransition>
    ))}
  </NotificationList>
));
