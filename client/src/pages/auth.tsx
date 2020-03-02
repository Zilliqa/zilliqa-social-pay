import React from 'react';
import styled from 'styled-components';
import { History } from 'history';

import { MainPagePath } from 'src/pages/main';

import { Img } from 'src/components/img';
import { Container } from 'src/components/container';
import { Input } from 'src/components/Input';
import { Button } from 'src/components/button';

import { SizeComponent } from 'src/config';

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

type Prop = {
  history: History;
}

export const AuthPagePath = '/auth';
export const AuthPage: React.SFC<Prop> = ({
  history
}) => {
  const handleContinue = React.useCallback(() => {
    history.push(MainPagePath);
  }, [history]);

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
