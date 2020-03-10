import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import TwitterLogin from 'react-twitter-auth';
import { useRouter } from 'next/router';
import { validation } from '@zilliqa-js/util';

import UserStore from 'store/user';

import { Img } from 'components/img';
import { Container } from 'components/container';
import { FieldInput } from 'components/Input';

import { SizeComponent, APIs } from 'config';

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

  // React hooks //
  const twitterLoginRef = React.useRef<HTMLDivElement>(null);

  const [addressErr, setAddressErr] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);

  const handleSuccess = React.useCallback(async (res: any) => {
    if (!address) {
      return null;
    }

    const userData = await res.json();

    await UserStore.updateAddress({
      address,
      jwt: userData.jwtToken
    });
    UserStore.setUser(userData);
    router.push('/');
  }, [address]);
  const handleAddressChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      return null;
    } else if (!validation.isBech32(event.target.value)) {
      setAddressErr('Incorect address format.');

      return null;
    }

    twitterLoginRef.current?.click();

    setAddress(event.target.value);
  }, [validation, setAddressErr, addressErr]);
  // React hooks //

  return (
    <React.Fragment>
      <TwitterLogin
        style={{ display: 'none' }}
        loginUrl={APIs.twitterAuth}
        requestTokenUrl={APIs.twitterAuthReverse}
        onSuccess={handleSuccess}
        onFailure={() => null}
        showIcon
      >
        <div ref={twitterLoginRef} />
      </TwitterLogin>
      <FormContainer>
        <Center>
          <LeftPanel>
            <SignForm>
              <FieldInput
                sizeVariant={SizeComponent.md}
                error={addressErr}
                placeholder="Zilliqa address (zil1) or ZNS."
                onBlur={handleAddressChange}
                onChange={() => setAddressErr(null)}
              />
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
