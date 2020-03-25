import React from 'react';

import UserStore from 'store/user';
import EventStore from 'store/event';

import TwitterLogin from 'react-twitter-auth';
import { Img } from 'components/img';
import { Text } from 'components/text';
import { AroundedContainer } from 'components/rounded-container';

import {
  FontColors,
  Fonts,
  FontSize,
  Sides,
  APIs,
  Events
} from 'config';

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
    <AroundedContainer style={{ display: show ? 'flex' : 'none' }}>
      <Img src="/icons/twitter.svg" />
      <Text
        fontColors={FontColors.white}
        fontVariant={Fonts.AvenirNextLTProDemi}
        size={FontSize.md}
      >
        Sign in Twitter
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
    </AroundedContainer>
  );
};
