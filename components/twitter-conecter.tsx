import React from 'react';
import styled from 'styled-components';

import UserStore from 'store/user';
import EventStore from 'store/event';

import TwitterLogin from 'react-twitter-auth';
import { Img } from 'components/img';
import { Text } from 'components/text';

import {
  FontColors,
  Fonts,
  FontSize,
  Sides,
  APIs,
  Events
} from 'config';

export const TwitterConnectContainer = styled.form`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;

  background-color: #5c63efb3;
  height: 400px;
  width: 300px;
  border-radius: 30px;

  margin-left: 10%;
  padding-top: 70px;
  padding-bottom: 70px;

  transition: all 1s ease-out;

  @media (max-width: 400px) {
    margin: 0;
  }
`;

const TwitterLoginStyles = {
  cursor: 'pointer',
  borderRadius: '20px',
  width: '150px',

  background: 'transparent',
  border: `1px solid ${FontColors.white}`
};

type Prop = {
  show?: boolean;
};

export const TwitterConnect: React.FC<Prop> = ({ show }) => {
  const handleSuccess = React.useCallback(async (res: any) => {
    const userData = await res.json();

    UserStore.setUser(userData);
    EventStore.reset();
  }, [UserStore, EventStore]);

  return (
    <TwitterConnectContainer style={{ display: show ? 'flex' : 'none' }}>
      <Img src="/icons/twitter.svg" />
      <Text
        fontColors={FontColors.white}
        fontVariant={Fonts.AvenirNextLTProDemi}
        size={FontSize.md}
      >
        Connect yourTwitter
      </Text>
      <TwitterLogin
        style={TwitterLoginStyles}
        loginUrl={APIs.twitterAuth}
        requestTokenUrl={APIs.twitterAuthReverse}
        onSuccess={handleSuccess}
        onFailure={() => EventStore.reset()}
        showIcon
      >
        <Text
          align={Sides.center}
          fontColors={FontColors.white}
          fontVariant={Fonts.AvenirNextLTProDemi}
          size={FontSize.sm}
          onClick={() => EventStore.setEvent(Events.Load)}
        >
          Connect
        </Text>
      </TwitterLogin>
    </TwitterConnectContainer>
  );
};
