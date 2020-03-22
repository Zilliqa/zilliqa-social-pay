import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
// import { useRouter } from 'next/router';
// import { validation } from '@zilliqa-js/util';

import { TwitterConnect } from 'components/twitter-conecter';
import { Container } from 'components/container';

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
  // Next hooks //
  // const router = useRouter();
  // Next hooks //


  return (
    <AuthContainer>
      <TwitterConnect />
    </AuthContainer>
  );
};

export default AuthPage;
