import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import * as Effector from 'effector-react';

import UserStore from 'store/user';
import BrowserStore from 'store/browser';

import { TwitterConnect } from 'components/twitter-conecter';
import { Container } from 'components/container';
import { ZilliqaConnect } from 'components/zilliqa-connect';
import { Img } from 'components/img';

const AuthContainer = styled(Container)`
  display: flex;
  align-items: center;

  background: linear-gradient(180.35deg, #7882F3 -3.17%, #7882F3 42.83%, #7882F3 80.35%, #5352EE 98.93%);
  background-repeat: space;

  height: 100vh;
  width: 100vw;

  @media (max-width: 600px) {
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 20%;
    background: linear-gradient(180.35deg, #7882F3 -3.17%, #7882F3 42.83%, #7882F3 80.35%, #5352EE 98.93%);
    background-repeat: round;
    background-repeat-y: no-repeat;
  }
`;
const Background = styled(Img)`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: auto;
`;

export const AuthPage: NextPage = () => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 546px)' });
  const router = useRouter();

  const userState = Effector.useStore(UserStore.store);
  const browserState = Effector.useStore(BrowserStore.store);

  const backgroundImg = React.useMemo(() => {
    if (isTabletOrMobile) {
      return `imgs/illustration-3-mobile.${browserState.format}`;
    }

    return `imgs/illustration-3.${browserState.format}`;
  }, [isTabletOrMobile, browserState]);

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
    <React.Fragment>
      <AuthContainer>
        <TwitterConnect show={Boolean(!userState.jwtToken)}/>
        <ZilliqaConnect show={Boolean(!userState.zilAddress && userState.jwtToken)}/>
      </AuthContainer>
      <Background src={backgroundImg}/>
    </React.Fragment>
  );
};

export default AuthPage;
