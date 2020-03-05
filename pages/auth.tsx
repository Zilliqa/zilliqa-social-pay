import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import TwitterLogin from 'react-twitter-auth';
import { useRouter } from 'next/router';
// import * as Effector from 'effector-react';

import UserStore from 'store/user';

import { Img } from 'components/img';
import { Container } from 'components/container';
import { Input } from 'components/Input';
import { Button } from 'components/button';

import { SizeComponent } from 'config';

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
  // const userState = Effector.useStore(UserStore.store);
  // Effector hooks //

  // React hooks //
  const handleContinue = React.useCallback(() => {
    router.push('/');
  }, []);
  const handleSuccess = React.useCallback(async (res: any) => {
    const userData = await res.json();

    UserStore.setUser(userData);
  }, []);
  const handleFailed = React.useCallback(() => {
    console.log('handleFailed');
  }, []);
  // React hooks //

  return (
    <React.Fragment>
      <FormContainer>
        <Center>
          <LeftPanel>
            <SignForm>
              <Input
                sizeVariant={SizeComponent.md}
                placeholder="Zilliqa address (zil1) or ZNS."
              />
              <TwitterLogin
                loginUrl="/api/v1/auth/twitter"
                onFailure={handleFailed}
                onSuccess={handleSuccess}
                requestTokenUrl="/api/v1/auth/twitter/reverse"
                showIcon
              />
              <Button
                sizeVariant={SizeComponent.lg}
                onClick={handleContinue}
              >
                Continue
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
