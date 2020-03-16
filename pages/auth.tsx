import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import TwitterLogin from 'react-twitter-auth';
import { useRouter } from 'next/router';
import { validation } from '@zilliqa-js/util';
import * as Effector from 'effector-react';
import Steps, { Step } from 'rc-steps';

import UserStore from 'store/user';
import EventStore from 'store/event';

import { Img } from 'components/img';
import { Container } from 'components/container';
import { FieldInput } from 'components/Input';
import { Button } from 'components/button';
import { Text } from 'components/text';

import { Events, SizeComponent, APIs, FontColors } from 'config';

const Center = styled(Container)`
  display: grid;
  justify-content: center;
  align-items: center;
  justify-items: center;
  grid-template-columns: 1fr;
  grid-gap: 30px;

  padding: 15px;
  width: 50%;
  min-width: 320px;
  min-height: 50vh;

  background: #F5F5F5;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;
const SignForm = styled(Container)`
  width: 100%;
  max-width: 400px;
  display: grid;
  grid-gap: 30px;
  justify-items: center;
`;
const TopImg = styled(Img)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;

  width: 60%;
  height: inherit;
`;
const BottomImg = styled(Img)`
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: -1;

  width: 40%;
  height: inherit;
`;

const TwitterLoginStyles = {
  cursor: 'pointer',
  borderRadius: '20px',
  padding: '0.2rem',

  background: 'transparent',
  border: `1px solid ${FontColors.info}`
};

export const AuthPage: NextPage = () => {
  // Next hooks //
  const router = useRouter();
  // Next hooks //

  // Effector hooks //
  const userState = Effector.useStore(UserStore.store);
  // Effector hooks //

  // React hooks //
  const [addressErr, setAddressErr] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);

  const stepsIndex = React.useMemo(() => {
    if (!userState || !userState.jwtToken) {
      return 0;
    } else if (userState.jwtToken && !userState.zilAddress) {
      return 1;
    }
  }, [userState]);

  const handleSuccess = React.useCallback(async (res: any) => {
    const userData = await res.json();

    UserStore.setUser(userData);
    EventStore.reset();

    console.log(userData);

    if (userData.synchronization || (userData.zilAddress && validation.isBech32(userData.zilAddress))) {
      router.push('/');

      return null;
    }
  }, [address]);
  const handleAddressChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressErr(null);

    if (!event.target.value) {
      return null;
    }

    setAddress(event.target.value);
  }, [validation, setAddressErr, addressErr]);
  const handleAddAddress = React.useCallback(async () => {
    if (!address) {
      setAddressErr('address must be required.');

      return null;
    } else if (!validation.isBech32(address)) {
      setAddressErr('Incorect address format.');

      return null;
    }

    EventStore.setEvent(Events.Load);
    const result = await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });

    if (result.message === 'ConfiguredUserAddress') {
      router.push('/');
    }

    EventStore.setEvent(Events.None);
  }, [setAddressErr, address]);
  // React hooks //

  return (
    <React.Fragment>
      <Center>
        <Img src="/imgs/sign.svg"/>
        <Steps
          current={stepsIndex}
          labelPlacement="vertical"
        >
          <Step
            title="Twitter"
            description={'Sign in with twitter`'}
          />
          <Step
            title="Zilliqa"
            description={'Assign Zilliqa address.'}
          />
        </Steps>
        <SignForm>
          {!userState.zilAddress ? (
            <React.Fragment>
              <TwitterLogin
                style={{
                  ...TwitterLoginStyles,
                  display: stepsIndex === 0 ? 'block' : 'none'
                }}
                loginUrl={APIs.twitterAuth}
                requestTokenUrl={APIs.twitterAuthReverse}
                onSuccess={handleSuccess}
                onFailure={() => EventStore.reset()}
                showIcon
              >
                <Text
                  css="font-size: 15px;margin: 0.3rem;"
                  fontColors={FontColors.info}
                  onClick={() => EventStore.setEvent(Events.Load)}
                >
                  Sign in with twitter
                </Text>
              </TwitterLogin>
              {userState.jwtToken ? (
                <React.Fragment>
                  <FieldInput
                    sizeVariant={SizeComponent.md}
                    error={addressErr}
                    placeholder="Zilliqa address (zil1) or ZNS."
                    onChange={handleAddressChange}
                  />
                  <Button
                    sizeVariant={SizeComponent.md}
                    onClick={handleAddAddress}
                  >
                    Assign address
                  </Button>
                </React.Fragment>
              ) : null}
            </React.Fragment>
          ) : null}
        </SignForm>
      </Center>
      <TopImg src="/imgs/auth-2.svg"/>
      <BottomImg src="/imgs/auth-1.svg"/>
    </React.Fragment>
  );
}

export default AuthPage;
