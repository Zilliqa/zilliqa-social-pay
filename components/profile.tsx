import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import UserStore from 'store/user';

import { Img } from 'components/img';

const NotificationContainer = styled.div`
  display: none;
  position: absolute;
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

export const Profile: React.FC = () => {
  const userState = Effector.useStore(UserStore.store);

  return (
    <React.Fragment>
      <ProfileContainer>
        <ImgContainer src={userState.profileImageUrl} />
      </ProfileContainer>
      <NotificationContainer>
        dsadsa
      </NotificationContainer>
    </React.Fragment>
  );
};
