import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import UserStore from 'store/user';

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
  z-index: 5;

  min-width: 300px;
  min-height: 200px;

  background: ${FontColors.gray};
  transform: translate(-74%, 40%);
  border-radius: 10px;

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
    content: "";
    position: absolute;

    width: 10px;
    height: 10px;

    background: #00ffff;

    border-radius: 50%;
    transform: translate(-20%, 300%);
  }
`;
const ImgContainer = styled(Img)`
  cursor: pointer;
  border-radius: 50%;
  border: 0.1rem #00ffff solid;
`;
const TitleContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  padding: 10px;
`;

export const Profile: React.FC = () => {
  const userState = Effector.useStore(UserStore.store);

  const [notificationShow, setNotificationShow] = React.useState(false);

  const handleClickProfile = React.useCallback(() => {
    setNotificationShow(!notificationShow);
  }, [notificationShow, setNotificationShow]);

  return (
    <React.Fragment>
      <ProfileContainer onClick={handleClickProfile}>
        <ImgContainer src={userState.profileImageUrl} />
      </ProfileContainer>
      <NotificationContainer show={notificationShow}>
        <TitleContainer>
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
          >
            Clear all
          </Text>
        </TitleContainer>
      </NotificationContainer>
      <Closer
        show={notificationShow}
        onClick={handleClickProfile}
      />
    </React.Fragment>
  );
};
