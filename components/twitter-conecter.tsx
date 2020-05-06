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
  APIs
} from 'config';

type Prop = {
  show?: boolean;
  connected: () => void;
};

/**
 * Form for oauth with twitter.
 * @prop show - Show or hidden component.
 */
export const TwitterConnect: React.FC<Prop> = ({ show, connected }) => {
  const handleSuccess = React.useCallback(async (res: any) => {
    const userData = await res.json();

    UserStore.setUser(userData);
    UserStore.setJWT(userData.jwtToken);

    connected();
    EventStore.reset();
  }, [UserStore, EventStore, connected]);

  return (
    <AroundedContainer style={{ display: show ? 'flex' : 'none' }}>
      <Img src="/icons/twitter.svg" />
      <Text
        fontColors={FontColors.white}
        fontVariant={Fonts.AvenirNextLTProDemi}
        size={FontSize.md}
      >
        Sign in using your Twitter account
      </Text>
      <TwitterLogin
        loginUrl={APIs.twitterAuth}
        requestTokenUrl={APIs.twitterAuthReverse}
        onSuccess={handleSuccess}
        onFailure={() => EventStore.reset()}
        showIcon
      >
        CONNECT
      </TwitterLogin>
    </AroundedContainer>
  );
};

export default TwitterConnect;
