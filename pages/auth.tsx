import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import TwitterLogin from 'react-twitter-auth';
import { useRouter } from 'next/router';
import { validation } from '@zilliqa-js/util';
import * as Effector from 'effector-react';

import UserStore from 'store/user';
import EventStore from 'store/event';

import { Img } from 'components/img';
import { Container } from 'components/container';
import { FieldInput } from 'components/Input';
import { Button } from 'components/button';
import { Text } from 'components/text';

import { Events, SizeComponent, APIs, FontSize, Sides, FontColors } from 'config';

const FormContainer = styled(Container)`
  display: grid;
  justify-items: center;

  width: 100vw;
  height: 100vh;
  z-index: 2;
`;
const Center = styled(Container)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 10%;
`;
const LeftPanel = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 15px;
  width: 40vw;
  min-width: 300px;
  background: #F5F5F5;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;
const RightPanel = styled(Container)`
  width: 40vw;
  min-width: 300px;
  border-top-right-radius: 5px;
  background: #057A8E;
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
const SignImg =  styled(Img)`
  width: 100%;
  height: inherit;
`;

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

  const handleSuccess = React.useCallback(async (res: any) => {
    const userData = await res.json();

    UserStore.setUser(userData);

    if (userData.zilAddress && validation.isBech32(userData.zilAddress)) {
      router.push('/');

      return null;
    }
  }, [address]);
  const handleAddressChange = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      return null;
    } else if (!validation.isBech32(event.target.value)) {
      setAddressErr('Incorect address format.');

      return null;
    }

    setAddress(event.target.value);

    if (!address) {
      return null;
    }

    EventStore.setEvent(Events.Load);
    const result = await UserStore.updateAddress({
      address,
      jwt: userState.jwtToken
    });
    EventStore.setEvent(Events.None);

    if (result.message) {
      setAddressErr(result.message);
    }

    if (result.zilAddress) {
      router.push('/');
    }
  }, [validation, setAddressErr, addressErr, address, userState]);
  // React hooks //

  return (
    <React.Fragment>
      <FormContainer>
        <Center>
          <LeftPanel>
            <SignForm>
              {!userState.zilAddress ? (
                <React.Fragment>
                  <Text
                    size={FontSize.md}
                    align={Sides.center}
                    fontColors={FontColors.info}
                  >
                    You need to tie your Zilliqa address.
                  </Text>
                  <TwitterLogin
                    loginUrl={APIs.twitterAuth}
                    requestTokenUrl={APIs.twitterAuthReverse}
                    onSuccess={handleSuccess}
                    onFailure={() => EventStore.reset()}
                    showIcon
                  />
                  {userState.jwtToken ? <FieldInput
                    sizeVariant={SizeComponent.md}
                    error={addressErr}
                    placeholder="Zilliqa address (zil1) or ZNS."
                    onInput={handleAddressChange}
                  /> : null}
                </React.Fragment>
              ) : null}
              <Button
                sizeVariant={SizeComponent.md}
                disabled={Boolean(!userState || !userState.zilAddress)}
                onClick={() => router.push('/')}
              >
                Next
              </Button>
            </SignForm>
          </LeftPanel>
          <RightPanel>
            <SignImg src="/imgs/sign.svg"/>
          </RightPanel>
        </Center>
      </FormContainer>
      <TopImg src="/imgs/auth-2.svg"/>
      <BottomImg src="/imgs/auth-1.svg"/>
    </React.Fragment>
  );
}

export default AuthPage;
