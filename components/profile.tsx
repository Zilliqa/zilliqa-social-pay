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
  min-height: 200px;

  background: ${FontColors.gray};
  border-radius: 10px;

  animation-duration: .5s;
  animation-name: fadeShow;

  :before {
    content: "";

    position: absolute;

    width: 50px;
    height: 50px;

    background: ${FontColors.gray};
    right: 20px;
    top: -10px;

    transform: rotate(45deg);
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
  border-bottom: 1px ${FontColors.black} solid;
`;
const NotificationItemContainer = styled(Container)`
  padding: 10px;
  border-bottom: 1px ${FontColors.black} solid;
`;
const FooterContainer = styled(Container)`
  display: flex;
  justify-content: center;
`;

export const Profile: React.FC = () => {
  const userState = Effector.useStore(UserStore.store);
  const notificationState = Effector.useStore(NotificationStore.store);

  const [notificationShow, setNotificationShow] = React.useState(false);

  const haveNotifications = React.useMemo(
    () => notificationState.serverNotifications.length > 0,
    [notificationState]
  );

  const handleClickProfile = React.useCallback(() => {
    if (!haveNotifications) {
      return null;
    }

    setNotificationShow(!notificationShow);
  }, [notificationShow, setNotificationShow, haveNotifications]);
  const handleRemoveAllNotifications = React.useCallback(() => {
    NotificationStore.removeNotifications(userState.jwtToken);
    setNotificationShow(false);
  }, [userState]);

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
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProRegular}
          >
            Notifications
          </Text>
          <Text
            fontColors={FontColors.primary}
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProDemi}
            css="cursor: pointer;z-index: 6;"
            onClick={handleRemoveAllNotifications}
          >
            Clear all
          </Text>
        </HeaderContainer>
        {notificationState.serverNotifications.map((item, index) => (
          <NotificationItemContainer key={index}>
            <Text
              fontColors={FontColors.black}
              size={FontSize.sm}
              fontVariant={Fonts.AvenirNextLTProBold}
            >
              {item.title}
            </Text>
            <Container css="display: flex;justify-content: space-between;">
              <Text
                fontColors={FontColors.black}
                size={FontSize.sm}
                fontVariant={Fonts.AvenirNextLTProRegular}
              >
                {item.description}
              </Text>
              <Text
                fontColors={FontColors.black}
                size={FontSize.sm}
                fontVariant={Fonts.AvenirNextLTProRegular}
                css="margin-left: 30px;"
              >
                {moment(item.createdAt).fromNow()}
              </Text>
            </Container>
          </NotificationItemContainer>
        ))}
        <FooterContainer>
          <Text
            fontColors={FontColors.primary}
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProDemi}
            css="cursor: pointer;"
          >
            More
          </Text>
        </FooterContainer>
      </NotificationContainer>
      <Closer
        show={notificationShow}
        onClick={handleClickProfile}
      />
    </React.Fragment>
  );
};
