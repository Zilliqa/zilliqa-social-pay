import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import UserStore from 'store/user';

import { TwitterConnect } from 'components/twitter-conecter';
import { Container } from 'components/container';
import { ZilliqaConnect } from 'components/zilliqa-connect';

const AuthContainer = styled(Container)`
  display: flex;
  align-items: center;

  background:
    url(/imgs/illustration-3.webp),
    linear-gradient(180.35deg, #7882F3 -3.17%, #7882F3 42.83%, #7882F3 80.35%, #5352EE 98.93%);
  background-repeat: space;

  height: 100vh;
  width: 100vw;

  @media (max-width: 600px) {
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 20%;
    background:
      url(/imgs/illustration-3-mobile.png),
      linear-gradient(180.35deg, #7882F3 -3.17%, #7882F3 42.83%, #7882F3 80.35%, #5352EE 98.93%);
    background-repeat: round;
    background-repeat-y: no-repeat;
  }
`;

export const AuthPage: NextPage = () => {
  const router = useRouter();
  const userState = Effector.useStore(UserStore.store);

  React.useEffect(() => {
    if (userState.jwtToken && userState.zilAddress && router.pathname.includes('auth')) {
      if (userState.message && userState.message === 'Unauthorized') {
        UserStore.clear();
      } else {
        router.push('/');
      }
    }
  }, [userState]);

  return (
    <AuthContainer>
      <TwitterConnect show={Boolean(!userState.jwtToken)}/>
      <ZilliqaConnect show={Boolean(!userState.zilAddress && userState.jwtToken)}/>
    </AuthContainer>
  );
};

export default AuthPage;
