import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import UserStore from 'store/user';
// import EventStore from 'store/event';

import { TwitterConnect } from 'components/twitter-conecter';
import { Container } from 'components/container';
import { ZilliqaConnect } from 'components/zilliqa-connect';

const AuthContainer = styled(Container)`
  display: flex;
  align-items: center;

  background:
    url(/imgs/illustration-3.svg),
    linear-gradient(90deg, rgb(120, 130, 243) 0%, rgb(120, 130, 243) 28%, rgb(83, 82, 238) 71%);

  height: 100vh;
  width: 100vw;

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

export const AuthPage: NextPage = () => {
  const router = useRouter();
  const userState = Effector.useStore(UserStore.store);

  React.useEffect(() => {
    if (userState.jwtToken && userState.zilAddress && router.pathname.includes('auth')) {
      router.push('/');
    }
  }, [userState]);

  return (
    <AuthContainer>
      {!userState.jwtToken ? <TwitterConnect /> : null}
      <ZilliqaConnect show={Boolean(!userState.zilAddress && userState.jwtToken)}/>
    </AuthContainer>
  );
};

export default AuthPage;
