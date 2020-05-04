import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';
import moment from 'moment';

import UserStore from 'store/user';
import NotificationStore from 'store/notification';

import { Img } from 'components/img';
import { Text } from 'components/text';
import { Container } from 'components/container';

import { FontColors, FontSize, Fonts } from 'config';

type ShwoType = {
  show: boolean;
};

const NotificationContainer = styled.div`
  display: ${(props: ShwoType) => props.show ? 'block' : 'none'};

  position: absolute;
  top: 100px;

  transform: translate(-74%, 0);

  z-index: 5;

  min-width: 300px;

  background: #F0F1FF;
  border-radius: 10px;

  animation-duration: .5s;
  animation-name: fadeShow;

  @media (max-width: 494px) {
    transform: translate(0, 0);
  }

  :before {
    content: "";

    position: absolute;

    width: 50px;
    height: 50px;

    background: #F0F1FF;
    right: 20px;
    top: -10px;

    transform: rotate(45deg);

    @media (max-width: 494px) {
      left: 10px;
    }
  }
`;
const Closer = styled.a`
  display: ${(props: ShwoType) => props.show ? 'block' : 'none'};
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 4;
`;
const ProfileContainer = styled.div`
  :before {
    ${(props: ShwoType) => props.show ? 'content: "";' : ''};
    position: absolute;

    width: 10px;
    height: 10px;

    background: #00ffff;

    border-radius: 50%;
    transform: translate(-20%, 300%);
  }
`;
const ImgContainer = styled(Img)`
  border-radius: 50%;

  ${(props: ShwoType) => props.show ? 'cursor: pointer;' : ''};
  ${(props: ShwoType) => props.show ? 'border: 0.1rem #00ffff solid;' : ''};
`;
const HeaderContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px #d0d0d7 solid;
`;
const NotificationItemContainer = styled(Container)`
  padding: 10px;
  ${(props: ShwoType) => props.show ? 'border-bottom: 1px #d0d0d7 solid;' : ''}
`;
const FooterContainer = styled(Container)`
  display: flex;
  justify-content: center;
`;

export const Profile: React.FC = () => {
  const userState = Effector.useStore(UserStore.store);
  const notificationState = Effector.useStore(NotificationStore.store);

  const [notificationShow, setNotificationShow] = React.useState(false);
  const [ofset, setOfset] = React.useState(Number(notificationState.limit));

  /**
   * Reactive varible, show `true` if have any notifications.
   */
  const haveNotifications = React.useMemo(
    () => notificationState.serverNotifications.length > 0,
    [notificationState]
  );
  /**
   * Show more notifications.
   * If count of notifications > storing in effector store and
   * ofset state <= count of notifications.
   */
  const showMore = React.useMemo(
    () => Number(notificationState.count - 1) > notificationState.serverNotifications.length,
    [
      notificationState.count,
      notificationState.serverNotifications,
      ofset
    ]
  );

  /**
   * Handler click to profile icon.
   * when clicked show popup with notifications.
   * also handle click to closer for close popup.
   */
  const handleClickProfile = React.useCallback(() => {
    if (!haveNotifications) {
      return null;
    }

    setNotificationShow(!notificationShow);
    setOfset(Number(notificationState.limit));
  }, [notificationShow, setNotificationShow, haveNotifications, notificationState.count]);

  /**
   * Hanlder for remove all notifications.
   */
  const handleRemoveAllNotifications = React.useCallback(() => {
    NotificationStore.removeNotifications(userState.jwtToken);
    setNotificationShow(false);
    setOfset(Number(notificationState.limit));
  }, [userState, notificationState.count]);

  /**
   * Handle for Click to More.
   * If clicked send to server requests.
   */
  const handleClickMore = React.useCallback(() => {
    const newOfset = ofset + 1;

    setOfset(newOfset);

    NotificationStore.getNotifications({
      offset: newOfset,
      limit: 1
    });
  }, [ofset, setOfset]);

  return (
    <React.Fragment>
      <ProfileContainer
        onClick={handleClickProfile}
        show={haveNotifications}
      >
        <ImgContainer
          src={userState.profileImageUrl}
          show={haveNotifications}
        />
      </ProfileContainer>
      <NotificationContainer show={notificationShow}>
        <HeaderContainer>
          <Text
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProMedium}
            css="z-index: 6;"
          >
            Notifications
          </Text>
          <Text
            fontColors={FontColors.primary}
            size={FontSize.sm}
            fontVariant={Fonts.AvenirNextLTProBold}
            css="cursor: pointer;z-index: 6;"
            onClick={handleRemoveAllNotifications}
          >
            Clear all
          </Text>
        </HeaderContainer>
        {notificationState.serverNotifications.map((item, index) => (
          <NotificationItemContainer
            key={index}
            show={!(index === notificationState.serverNotifications.length - 1 && !showMore)}
          >
            <Text
              fontColors={FontColors.black}
              size={FontSize.sm}
              fontVariant={Fonts.AvenirNextLTProMedium}
            >
              {item.title}
            </Text>
            <Container css="display: flex;justify-content: space-between;">
              <Text
                fontColors={FontColors.black}
                size={FontSize.sm}
                fontVariant={Fonts.AvenirNextLTProDemi}
              >
                {item.description}
              </Text>
              <Text
                fontColors={FontColors.black}
                size={FontSize.sm}
                fontVariant={Fonts.AvenirNextLTProDemi}
                css="margin-left: 30px;"
              >
                {moment(item.createdAt).fromNow()}
              </Text>
            </Container>
          </NotificationItemContainer>
        ))}
        {showMore ? (
          <FooterContainer>
            <Text
              fontColors={FontColors.primary}
              size={FontSize.sm}
              fontVariant={Fonts.AvenirNextLTProBold}
              css="cursor: pointer;"
              onClick={handleClickMore}
            >
              More
          </Text>
          </FooterContainer>
        ) : null}
      </NotificationContainer>
      <Closer
        show={notificationShow}
        onClick={handleClickProfile}
      />
    </React.Fragment>
  );
};
