import React from 'react';
import styled from 'styled-components';
import * as Effector from 'effector-react';

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

const TwitterConnectContainer = styled.div`
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

export const TwitterConnect: React.FC = () => {
  const userState = Effector.useStore(UserStore.store);

  const handleSuccess = React.useCallback(async (res: any) => {
    console.log(res, userState);
  }, []);

  return (
    <TwitterConnectContainer>
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
